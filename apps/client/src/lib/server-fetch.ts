import "server-only";
import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/cookies";

export type ServerFetchQueryParams =
  | Record<
      string,
      | string
      | number
      | boolean
      | null
      | undefined
      | (string | number | boolean | null | undefined)[]
    >
  | URLSearchParams;

export interface ServerFetchOptions<TBody = unknown> extends Omit<
  RequestInit,
  "body"
> {
  /**
   * Request body.
   * If a plain JavaScript object is provided, it will be automatically JSON-serialized
   * and 'Content-Type: application/json' will be set.
   * You can also pass standard BodyInit (FormData, URLSearchParams, Blob, string, etc.).
   */
  body?: TBody | BodyInit | null;

  /**
   * URL search parameters to serialize and append to the request URL.
   */
  params?: ServerFetchQueryParams;

  /**
   * Explicit Bearer token to use for Authorization.
   * If omitted, serverFetch automatically extracts the `accessToken` from Next.js HttpOnly cookies
   * when calling same-origin API endpoints.
   */
  token?: string;

  /**
   * If true, serverFetch will NOT automatically read or attach the cookie token.
   * Recommended for public/ISR endpoints to preserve static/revalidated rendering.
   * Default: false.
   */
  anonymous?: boolean;

  /**
   * Custom base URL to use.
   * Defaults to `process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`.
   */
  baseUrl?: string;

  /**
   * Format to parse the response body into.
   * - 'json': Parses response as JSON (default)
   * - 'text': Returns raw text
   * - 'blob': Returns Blob
   * - 'arrayBuffer': Returns ArrayBuffer
   * - 'raw': Returns the raw Response object
   */
  responseType?: "json" | "text" | "blob" | "arrayBuffer" | "raw";

  /**
   * Optional request timeout in milliseconds.
   * When exceeded, the underlying fetch request is aborted via AbortController.
   */
  timeout?: number;

  /**
   * Next.js Data Cache configuration passed through to `fetch`.
   */
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

export class ServerFetchError<TData = unknown> extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly response: Response;
  readonly data: TData | null;

  constructor(
    message: string,
    options: {
      status: number;
      statusText: string;
      url: string;
      response: Response;
      data: TData | null;
    }
  ) {
    super(message);
    this.name = "ServerFetchError";
    this.status = options.status;
    this.statusText = options.statusText;
    this.url = options.url;
    this.response = options.response;
    this.data = options.data;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServerFetchError);
    }
  }
}

export function isServerFetchError(error: unknown): error is ServerFetchError {
  return error instanceof ServerFetchError;
}

export function isNextRouterError(error: unknown): boolean {
  if (error && typeof error === "object" && "digest" in error) {
    const digest = String((error as { digest?: unknown }).digest);
    return (
      digest.startsWith("NEXT_REDIRECT") ||
      digest.startsWith("NEXT_NOT_FOUND") ||
      digest.startsWith("NEXT_HTTP_ERROR_FALLBACK") ||
      digest.startsWith("NEXT_PRERENDER_INTERRUPTED") ||
      digest.startsWith("DYNAMIC_SERVER_USAGE")
    );
  }
  return false;
}

export async function serverFetch<T = unknown, TBody = unknown>(
  input: string | URL,
  options: ServerFetchOptions<TBody> = {}
): Promise<T> {
  const {
    body,
    params,
    token: explicitToken,
    anonymous = false,
    baseUrl: customBaseUrl,
    responseType = "json",
    timeout,
    headers,
    signal: externalSignal,
    ...fetchInit
  } = options;

  // 1. Resolve base URL and target endpoint
  const defaultBaseUrl =
    process.env.SERVER_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

  const resolvedBaseUrl = customBaseUrl || defaultBaseUrl;
  const rawUrl = typeof input === "string" ? input : input.toString();
  const isAbsoluteInput =
    rawUrl.startsWith("http://") || rawUrl.startsWith("https://");

  const baseUrlObj = new URL(resolvedBaseUrl);
  const targetUrl = isAbsoluteInput
    ? new URL(rawUrl)
    : new URL(
        `${resolvedBaseUrl.replace(/\/+$/, "")}/${rawUrl.replace(/^\/+/, "")}`
      );

  const isSameOriginAsApi =
    !isAbsoluteInput || targetUrl.origin === baseUrlObj.origin;

  // 2. Append query parameters safely (preserves existing query params and #hash)
  if (params) {
    if (params instanceof URLSearchParams) {
      params.forEach((value, key) => {
        targetUrl.searchParams.append(key, value);
      });
    } else {
      for (const [key, val] of Object.entries(params)) {
        if (val !== undefined && val !== null) {
          if (Array.isArray(val)) {
            val.forEach((item) => {
              if (item !== undefined && item !== null) {
                targetUrl.searchParams.append(key, String(item));
              }
            });
          } else {
            targetUrl.searchParams.append(key, String(val));
          }
        }
      }
    }
  }

  const fullUrl = targetUrl.toString();

  // 3. Resolve Request Headers
  const reqHeaders = new Headers(headers);

  // 4. Resolve Auth Token (Explicit or Same-Origin Cookie)
  let authToken = explicitToken;
  if (
    !authToken &&
    !anonymous &&
    isSameOriginAsApi &&
    !reqHeaders.has("Authorization")
  ) {
    try {
      const cookieStore = await cookies();
      authToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
    } catch (error) {
      if (isNextRouterError(error)) {
        throw error;
      }
      // Called outside Next.js request context (e.g. build time static analysis)
    }
  }

  if (authToken && !reqHeaders.has("Authorization")) {
    reqHeaders.set("Authorization", `Bearer ${authToken}`);
  }

  if (responseType === "json" && !reqHeaders.has("Accept")) {
    reqHeaders.set("Accept", "application/json");
  }

  // 5. Serialize Body
  let serializedBody: BodyInit | null | undefined = undefined;
  if (body !== undefined && body !== null) {
    if (typeof FormData !== "undefined" && body instanceof FormData) {
      // Remove any manual Content-Type so fetch generates the multipart boundary
      reqHeaders.delete("Content-Type");
      serializedBody = body;
    } else if (
      typeof body === "string" ||
      (typeof URLSearchParams !== "undefined" &&
        body instanceof URLSearchParams) ||
      (typeof Blob !== "undefined" && body instanceof Blob) ||
      (typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer) ||
      ArrayBuffer.isView(body) ||
      (typeof ReadableStream !== "undefined" && body instanceof ReadableStream)
    ) {
      serializedBody = body as BodyInit;
    } else if (typeof body === "object") {
      serializedBody = JSON.stringify(body);
      if (!reqHeaders.has("Content-Type")) {
        reqHeaders.set("Content-Type", "application/json");
      }
    } else {
      serializedBody = String(body);
    }
  }

  // 6. Execute Native Fetch (with optional timeout & signal composition)
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let effectiveSignal: AbortSignal | undefined = externalSignal ?? undefined;
  let abortController: AbortController | undefined;
  let onExternalAbort: (() => void) | undefined;

  if (typeof timeout === "number" && timeout >= 0) {
    abortController = new AbortController();
    effectiveSignal = abortController.signal;

    if (externalSignal) {
      if (externalSignal.aborted) {
        abortController.abort(externalSignal.reason);
      } else {
        onExternalAbort = () => {
          abortController?.abort(externalSignal.reason);
        };
        externalSignal.addEventListener("abort", onExternalAbort, {
          once: true,
        });
      }
    }

    timeoutId = setTimeout(() => {
      const timeoutError =
        typeof DOMException !== "undefined"
          ? new DOMException(
              `Request timed out after ${timeout}ms`,
              "TimeoutError"
            )
          : new Error(`Request timed out after ${timeout}ms`);
      abortController?.abort(timeoutError);
    }, timeout);
  }

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...fetchInit,
      headers: reqHeaders,
      body: serializedBody,
      signal: effectiveSignal,
    });
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    if (externalSignal && onExternalAbort) {
      externalSignal.removeEventListener("abort", onExternalAbort);
    }
  }

  // 7. Handle HTTP Error Responses
  if (!response.ok) {
    let rawText = "";
    try {
      rawText = await response.text();
    } catch {
      // Ignore body read errors on failed responses
    }

    let errorData: unknown = null;
    if (rawText) {
      try {
        errorData = JSON.parse(rawText);
      } catch {
        errorData = rawText;
      }
    }

    let message = `Server fetch to "${fullUrl}" failed with HTTP ${response.status} (${response.statusText})`;
    if (errorData && typeof errorData === "object" && "message" in errorData) {
      const rawMessage = (errorData as { message?: unknown }).message;
      if (typeof rawMessage === "string" && rawMessage) {
        message = rawMessage;
      } else if (Array.isArray(rawMessage)) {
        const parts = rawMessage.filter(
          (item): item is string => typeof item === "string" && item.length > 0
        );
        if (parts.length > 0) {
          message = parts.join(", ");
        }
      }
    }

    throw new ServerFetchError(message, {
      status: response.status,
      statusText: response.statusText,
      url: fullUrl,
      response,
      data: errorData,
    });
  }

  // 8. Parse and Return Data by ResponseType
  if (responseType === "raw") {
    return response as unknown as T;
  }
  if (responseType === "text") {
    return (await response.text()) as unknown as T;
  }
  if (responseType === "blob") {
    return (await response.blob()) as unknown as T;
  }
  if (responseType === "arrayBuffer") {
    return (await response.arrayBuffer()) as unknown as T;
  }

  if (response.status === 204 || response.status === 205) {
    return null as unknown as T;
  }

  // Default: json
  const responseText = await response.text();
  if (!responseText) {
    return null as unknown as T;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new ServerFetchError(
      `Failed to parse JSON response from "${fullUrl}" (HTTP ${response.status})`,
      {
        status: response.status,
        statusText: response.statusText,
        url: fullUrl,
        response,
        data: responseText,
      }
    );
  }
}

serverFetch.get = <T = unknown>(
  input: string | URL,
  options?: Omit<ServerFetchOptions<never>, "method" | "body">
) => serverFetch<T, never>(input, { ...options, method: "GET" });

serverFetch.post = <T = unknown, TBody = unknown>(
  input: string | URL,
  body?: TBody | BodyInit | null,
  options?: Omit<ServerFetchOptions<TBody>, "method" | "body">
) => serverFetch<T, TBody>(input, { ...options, method: "POST", body });

serverFetch.put = <T = unknown, TBody = unknown>(
  input: string | URL,
  body?: TBody | BodyInit | null,
  options?: Omit<ServerFetchOptions<TBody>, "method" | "body">
) => serverFetch<T, TBody>(input, { ...options, method: "PUT", body });

serverFetch.patch = <T = unknown, TBody = unknown>(
  input: string | URL,
  body?: TBody | BodyInit | null,
  options?: Omit<ServerFetchOptions<TBody>, "method" | "body">
) => serverFetch<T, TBody>(input, { ...options, method: "PATCH", body });

serverFetch.delete = <T = unknown, TBody = unknown>(
  input: string | URL,
  options?: Omit<ServerFetchOptions<TBody>, "method">
) => serverFetch<T, TBody>(input, { ...options, method: "DELETE" });
