"use client";

import React, { useRef, useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthInitializer } from "./auth-initializer";
import { Toaster } from "./ui/sonner";
import { useAuthStore } from "@/store/use-auth-store";

export default function Provider({
  children,
  initialToken,
}: {
  children: React.ReactNode;
  initialToken?: string | null;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Synchronously seed auth store on the very first render before children mount
  const initialized = useRef(false);
  if (!initialized.current) {
    if (initialToken) {
      useAuthStore.getState().setTokens({ accessToken: initialToken });
    } else {
      useAuthStore.getState().setIsHydrating(false);
    }
    initialized.current = true;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer initialToken={initialToken} />
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster />
      {children}
    </QueryClientProvider>
  );
}
