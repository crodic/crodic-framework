/*!
MIT License

Copyright (c) 2026 Shadcn Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { flushSync } from "react-dom";
import type { ReactNode } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

/** Transition type added to every theme change, see `addTransitionType`. */
export const THEME_TRANSITION_TYPE = "theme-transition";

/**
 * Where the transition starts. Pass the click event to start at the pointer
 * (keyboard clicks fall back to the button's centre), an element to start at
 * its centre, or nothing to start at the centre of the viewport.
 */
export type ThemeTransitionOrigin =
  | {
      clientX: number;
      clientY: number;
      currentTarget?: EventTarget | null;
    }
  | Element;

export interface ThemeTransitionOptions {
  /** Style slug, e.g. `"circle-reveal"`. Defaults to the provider's `transition`. */
  transition?: string;
  origin?: ThemeTransitionOrigin;
}

interface ThemeTransitionContextValue {
  /** `false` on the server and until the stored theme has been read. */
  mounted: boolean;
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme, options?: ThemeTransitionOptions) => void;
  toggleTheme: (options?: ThemeTransitionOptions) => void;
}

const ThemeTransitionContext =
  createContext<ThemeTransitionContextValue | null>(null);

const DARK_QUERY = "(prefers-color-scheme: dark)";

const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark" || value === "system";

/**
 * Inline script that applies the stored theme before the first paint. Render
 * it in `<head>` through `<ThemeTransitionScript />`.
 */
export const getThemeScript = (
  storageKey = "theme",
  defaultTheme: Theme = "system"
) =>
  `(function(){try{var t=localStorage.getItem(${JSON.stringify(storageKey)})||${JSON.stringify(defaultTheme)};var d=t==="dark"||(t==="system"&&matchMedia(${JSON.stringify(DARK_QUERY)}).matches);var r=document.documentElement;r.classList.remove("light","dark");r.classList.add(d?"dark":"light");r.style.colorScheme=d?"dark":"light"}catch(e){}})()`;

export const ThemeTransitionScript = ({
  storageKey,
  defaultTheme,
  nonce,
}: {
  storageKey?: string;
  defaultTheme?: Theme;
  nonce?: string;
}) => (
  <script
    nonce={nonce}
    suppressHydrationWarning
    // oxlint-disable-next-line react/no-danger -- runs before hydration to avoid a flash of the wrong theme
    dangerouslySetInnerHTML={{
      __html: getThemeScript(storageKey, defaultTheme),
    }}
  />
);

/**
 * Writes the transition geometry to the root element (`:root`), which
 * `::view-transition-*(root)` pseudo-elements inherit from, so animations
 * originate from the pointer/control or viewport center.
 */
const writeTransitionVars = (
  origin: ThemeTransitionOrigin | undefined,
  duration: number | undefined,
  easing: string | undefined
) => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  let x = width / 2;
  let y = height / 2;
  if (origin instanceof Element) {
    const box = origin.getBoundingClientRect();
    x = box.left + box.width / 2;
    y = box.top + box.height / 2;
  } else if (origin) {
    const target = origin.currentTarget;
    // Keyboard activation reports a (0, 0) click; use the control instead.
    if (
      origin.clientX === 0 &&
      origin.clientY === 0 &&
      target instanceof Element
    ) {
      const box = target.getBoundingClientRect();
      x = box.left + box.width / 2;
      y = box.top + box.height / 2;
    } else {
      x = origin.clientX;
      y = origin.clientY;
    }
  }

  const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
  const { style } = document.documentElement;
  style.setProperty("--tk-x", `${x}px`);
  style.setProperty("--tk-y", `${y}px`);
  style.setProperty("--tk-left", "0px");
  style.setProperty("--tk-top", "0px");
  style.setProperty("--tk-cx", `${width / 2}px`);
  style.setProperty("--tk-cy", `${height / 2}px`);
  style.setProperty("--tk-r", `${radius}px`);
  if (duration === undefined) {
    style.removeProperty("--tk-theme-duration");
  } else {
    style.setProperty("--tk-theme-duration", `${duration}ms`);
  }
  if (easing === undefined) {
    style.removeProperty("--tk-theme-easing");
  } else {
    style.setProperty("--tk-theme-easing", easing);
  }
};

export interface ThemeTransitionProviderProps {
  children: ReactNode;
  /** Style used when `setTheme` is called without one. */
  transition?: string;
  defaultTheme?: Theme;
  storageKey?: string;
  /** Overrides every style's duration, in milliseconds. */
  duration?: number;
  /** Overrides every style's easing function. */
  easing?: string;
}

/**
 * Owns the theme and animates changes across the full root viewport (including
 * Radix Portals like Sheet/Dialog/Popover) using `document.startViewTransition()`.
 */
export const ThemeTransitionProvider = ({
  children,
  transition = "circle-reveal",
  defaultTheme = "system",
  storageKey = "theme",
  duration,
  easing,
}: ThemeTransitionProviderProps) => {
  const [state, setState] = useState<{
    theme: Theme;
    transition: string;
  } | null>(null);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const sync = () => setSystemTheme(query.matches ? "dark" : "light");
    sync();
    query.addEventListener("change", sync);

    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(storageKey);
    } catch {
      // Use the default theme when storage is unavailable.
    }
    setState({
      theme: isTheme(stored) ? stored : defaultTheme,
      transition,
    });

    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey) {
        const theme = isTheme(event.newValue) ? event.newValue : defaultTheme;
        setState((current) => ({
          theme,
          transition: current?.transition ?? transition,
        }));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      query.removeEventListener("change", sync);
      window.removeEventListener("storage", onStorage);
    };
    // Read the stored theme once; later prop changes only affect new transitions.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const theme = state?.theme ?? defaultTheme;
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  // Layout effects run inside React's view transition update, so the root
  // class is already flipped when the browser captures the new snapshot.
  useLayoutEffect(() => {
    if (!state) {
      return;
    }
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme, state]);

  const setTheme = useCallback(
    (next: Theme, options: ThemeTransitionOptions = {}) => {
      if (next === theme) return;

      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        // The theme still applies for this session.
      }

      const nextState = {
        theme: next,
        transition: options.transition ?? transition,
      };
      const nextResolvedTheme = next === "system" ? systemTheme : next;
      if (
        typeof document.startViewTransition !== "function" ||
        nextResolvedTheme === resolvedTheme ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setState(nextState);
        return;
      }

      writeTransitionVars(options.origin, duration, easing);
      const root = document.documentElement;
      root.dataset.themeTransition = nextState.transition;

      const vt = document.startViewTransition(() => {
        flushSync(() => {
          setState(nextState);
        });
        root.classList.remove("light", "dark");
        root.classList.add(nextResolvedTheme);
        root.style.colorScheme = nextResolvedTheme;
      });

      void vt.finished
        .catch(() => {})
        .finally(() => {
          delete root.dataset.themeTransition;
        });
    },
    [
      duration,
      easing,
      resolvedTheme,
      storageKey,
      systemTheme,
      theme,
      transition,
    ]
  );

  const toggleTheme = useCallback(
    (options?: ThemeTransitionOptions) =>
      setTheme(resolvedTheme === "dark" ? "light" : "dark", options),
    [resolvedTheme, setTheme]
  );

  const mounted = state !== null;
  const value = useMemo(
    () => ({ mounted, resolvedTheme, setTheme, theme, toggleTheme }),
    [mounted, resolvedTheme, setTheme, theme, toggleTheme]
  );

  return (
    <ThemeTransitionContext value={value}>{children}</ThemeTransitionContext>
  );
};

export const useThemeTransition = () => {
  const context = use(ThemeTransitionContext);
  if (!context) {
    throw new Error(
      "useThemeTransition must be used within <ThemeTransitionProvider>."
    );
  }
  return context;
};
