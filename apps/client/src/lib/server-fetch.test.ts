import { describe, it, expect, vi, beforeEach } from "vitest";
import { serverFetch, ServerFetchError } from "./server-fetch";
import { COOKIE_ACCESS_TOKEN } from "@/lib/cookies";

// Mock next/headers
const mockGetCookie = vi.fn();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: mockGetCookie,
  }),
}));

describe("serverFetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCookie.mockReturnValue({ value: "mock-cookie-token" });
    // Reset global.fetch mock
    global.fetch = vi.fn();
  });

  it("automatically attaches Authorization Bearer token from cookies", async () => {
    (global.fetch as any).mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await serverFetch<{ success: boolean }>("/api/v1/test");

    expect(result).toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/test"),
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );

    const callHeaders = (global.fetch as any).mock.calls[0][1]
      .headers as Headers;
    expect(callHeaders.get("Authorization")).toBe("Bearer mock-cookie-token");
    expect(callHeaders.get("Accept")).toBe("application/json");
  });

  it("allows explicit token override", async () => {
    (global.fetch as any).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    await serverFetch("/api/v1/test", { token: "explicit-token" });

    const callHeaders = (global.fetch as any).mock.calls[0][1]
      .headers as Headers;
    expect(callHeaders.get("Authorization")).toBe("Bearer explicit-token");
  });

  it("does not attach token when anonymous: true", async () => {
    (global.fetch as any).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    await serverFetch("/api/v1/test", { anonymous: true });

    const callHeaders = (global.fetch as any).mock.calls[0][1]
      .headers as Headers;
    expect(callHeaders.get("Authorization")).toBeNull();
  });

  it("correctly serializes query params", async () => {
    (global.fetch as any).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    await serverFetch("/api/v1/posts", {
      params: {
        page: 1,
        limit: 10,
        tags: ["anime", "cosplay"],
        empty: undefined,
      },
    });

    const callUrl = (global.fetch as any).mock.calls[0][0] as string;
    expect(callUrl).toContain("page=1");
    expect(callUrl).toContain("limit=10");
    expect(callUrl).toContain("tags=anime");
    expect(callUrl).toContain("tags=cosplay");
    expect(callUrl).not.toContain("empty");
  });

  it("automatically JSON-serializes object body and sets Content-Type", async () => {
    (global.fetch as any).mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "123" }), { status: 201 })
    );

    const payload = { title: "New Post", likes: 0 };
    await serverFetch.post("/api/v1/posts", payload);

    const callOptions = (global.fetch as any).mock.calls[0][1];
    expect(callOptions.method).toBe("POST");
    expect(callOptions.body).toBe(JSON.stringify(payload));
    expect((callOptions.headers as Headers).get("Content-Type")).toBe(
      "application/json"
    );
  });

  it("throws ServerFetchError on 4xx/5xx responses with structured error data", async () => {
    (global.fetch as any).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ message: "Post not found", error: "Not Found" }),
        {
          status: 404,
          statusText: "Not Found",
        }
      )
    );

    await expect(serverFetch("/api/v1/posts/invalid")).rejects.toThrowError(
      ServerFetchError
    );

    try {
      (global.fetch as any).mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Post not found" }), {
          status: 404,
          statusText: "Not Found",
        })
      );
      await serverFetch("/api/v1/posts/invalid");
    } catch (err) {
      const error = err as ServerFetchError;
      expect(error.status).toBe(404);
      expect(error.statusText).toBe("Not Found");
      expect(error.data).toEqual({ message: "Post not found" });
      expect(error.message).toBe("Post not found");
    }
  });

  it("supports text and raw responseType", async () => {
    (global.fetch as any).mockResolvedValueOnce(
      new Response("plain text response", { status: 200 })
    );

    const text = await serverFetch<string>("/api/v1/health", {
      responseType: "text",
    });
    expect(text).toBe("plain text response");

    (global.fetch as any).mockResolvedValueOnce(
      new Response("raw response", { status: 200 })
    );

    const rawResponse = await serverFetch<Response>("/api/v1/raw", {
      responseType: "raw",
    });
    expect(rawResponse).toBeInstanceOf(Response);
  });

  it("supports method helpers (get, post, put, patch, delete)", async () => {
    (global.fetch as any).mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      )
    );

    await serverFetch.get("/test");
    expect((global.fetch as any).mock.calls[0][1].method).toBe("GET");

    await serverFetch.delete("/test/1");
    expect((global.fetch as any).mock.calls[1][1].method).toBe("DELETE");

    await serverFetch.put("/test/1", { name: "updated" });
    expect((global.fetch as any).mock.calls[2][1].method).toBe("PUT");

    await serverFetch.patch("/test/1", { name: "patched" });
    expect((global.fetch as any).mock.calls[3][1].method).toBe("PATCH");
  });
});
