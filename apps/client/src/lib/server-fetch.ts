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
   * If omitted, serverFetch automatically extracts the `accessToken` from Next.js HttpOnly cookies.
   */
  token?: string;

  /**
   * If true, serverFetch will NOT automatically read or attach the cookie token.
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

function isNextRouterError(error: unknown): boolean {
  if (error && typeof error === "object" && "digest" in error) {
    const digest = String((error as { digest?: unknown }).digest);
    return (
      digest.startsWith("NEXT_REDIRECT") ||
      digest.startsWith("NEXT_NOT_FOUND") ||
      digest.startsWith("DYNAMIC_SERVER_USAGE")
    );
  }
  return false;
}

export async function serverFetch<T = any>(
  input: string | URL,
  options: ServerFetchOptions = {}
): Promise<T> {
  const {
    body,
    params,
    token: explicitToken,
    anonymous = false,
    baseUrl: customBaseUrl,
    responseType = "json",
    headers,
    ...fetchInit
  } = options;

  // 1. Resolve base URL and target endpoint
  const defaultBaseUrl =
    process.env.SERVER_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

  const resolvedBaseUrl = customBaseUrl || defaultBaseUrl;
  const rawUrl = typeof input === "string" ? input : input.toString();

  let fullUrl =
    rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
      ? rawUrl
      : `${resolvedBaseUrl.replace(/\/+$/, "")}/${rawUrl.replace(/^\/+/, "")}`;

  // 2. Append query parameters
  if (params) {
    const searchParams =
      params instanceof URLSearchParams
        ? new URLSearchParams(params)
        : new URLSearchParams();

    if (!(params instanceof URLSearchParams)) {
      for (const [key, val] of Object.entries(params)) {
        if (val !== undefined && val !== null) {
          if (Array.isArray(val)) {
            val.forEach((item) => {
              if (item !== undefined && item !== null) {
                searchParams.append(key, String(item));
              }
            });
          } else {
            searchParams.append(key, String(val));
          }
        }
      }
    }

    const qs = searchParams.toString();
    if (qs) {
      fullUrl += `${fullUrl.includes("?") ? "&" : "?"}${qs}`;
    }
  }

  // 3. Resolve Request Headers
  const reqHeaders = new Headers(headers);

  // 4. Resolve Auth Token (Cookie or Explicit)
  let authToken = explicitToken;
  if (!authToken && !anonymous) {
    try {
      const cookieStore = await cookies();
      authToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
    } catch {
      // Called outside Next.js request context (e.g. build time static analysis)
    }
  }

  if (authToken && !reqHeaders.has("Authorization")) {
    reqHeaders.set("Authorization", `Bearer ${authToken}`);
  }

  if (!reqHeaders.has("Accept")) {
    reqHeaders.set("Accept", "application/json");
  }

  // 5. Serialize Body
  let serializedBody: BodyInit | null | undefined = undefined;
  if (body !== undefined && body !== null) {
    if (
      typeof body === "string" ||
      body instanceof FormData ||
      body instanceof URLSearchParams ||
      body instanceof Blob ||
      body instanceof ArrayBuffer ||
      ArrayBuffer.isView(body) ||
      body instanceof ReadableStream
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

  // 6. Execute Native Fetch
  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...fetchInit,
      headers: reqHeaders,
      body: serializedBody,
    });
  } catch (error) {
    if (isNextRouterError(error)) {
      throw error;
    }
    throw error;
  }

  // 7. Handle HTTP Error Responses
  if (!response.ok) {
    let errorData: unknown = null;
    try {
      const text = await response.text();
      errorData = text ? JSON.parse(text) : null;
    } catch {
      // Ignore body parsing error on error response
    }

    let message = `Server fetch to "${fullUrl}" failed with HTTP ${response.status} (${response.statusText})`;
    if (
      errorData &&
      typeof errorData === "object" &&
      "message" in errorData &&
      typeof (errorData as { message?: unknown }).message === "string"
    ) {
      message = (errorData as { message: string }).message;
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

  // Default: json
  const responseText = await response.text();
  if (!responseText) {
    return null as unknown as T;
  }
  return JSON.parse(responseText) as T;
}

serverFetch.get = <T = any>(
  input: string | URL,
  options?: Omit<ServerFetchOptions, "method" | "body">
) => serverFetch<T>(input, { ...options, method: "GET" });

serverFetch.post = <T = any, TBody = unknown>(
  input: string | URL,
  body?: TBody | BodyInit | null,
  options?: Omit<ServerFetchOptions<TBody>, "method" | "body">
) => serverFetch<T>(input, { ...options, method: "POST", body });

serverFetch.put = <T = any, TBody = unknown>(
  input: string | URL,
  body?: TBody | BodyInit | null,
  options?: Omit<ServerFetchOptions<TBody>, "method" | "body">
) => serverFetch<T>(input, { ...options, method: "PUT", body });

serverFetch.patch = <T = any, TBody = unknown>(
  input: string | URL,
  body?: TBody | BodyInit | null,
  options?: Omit<ServerFetchOptions<TBody>, "method" | "body">
) => serverFetch<T>(input, { ...options, method: "PATCH", body });

serverFetch.delete = <T = any>(
  input: string | URL,
  options?: Omit<ServerFetchOptions, "method">
) => serverFetch<T>(input, { ...options, method: "DELETE" });
