import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { extractSubdomain, buildSubdomainUrl, buildRootUrl } from "./subdomain";

describe("Subdomain Utilities", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("extractSubdomain", () => {
    it("returns null for localhost without subdomain", () => {
      expect(extractSubdomain("localhost:3000", "localhost:3000")).toBeNull();
      expect(extractSubdomain("localhost", "localhost")).toBeNull();
      expect(extractSubdomain("127.0.0.1:3000")).toBeNull();
    });

    it("extracts subdomain from localhost format (RFC 6761)", () => {
      expect(extractSubdomain("kosume.localhost:3000", "localhost:3000")).toBe(
        "kosume"
      );
      expect(extractSubdomain("tenant-a.localhost")).toBe("tenant-a");
      expect(extractSubdomain("www.localhost:3000")).toBeNull();
    });

    it("returns null for production root domain", () => {
      expect(extractSubdomain("crodic.click", "crodic.click")).toBeNull();
      expect(extractSubdomain("www.crodic.click", "crodic.click")).toBeNull();
      expect(extractSubdomain("crodic.click:443", "crodic.click")).toBeNull();
    });

    it("extracts subdomain from production domain", () => {
      expect(extractSubdomain("kosume.crodic.click", "crodic.click")).toBe(
        "kosume"
      );
      expect(
        extractSubdomain("tenant-b.crodic.click:443", "crodic.click")
      ).toBe("tenant-b");
    });

    it("handles arbitrary root domain from environment variable", () => {
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = "example.com";
      expect(extractSubdomain("example.com")).toBeNull();
      expect(extractSubdomain("www.example.com")).toBeNull();
      expect(extractSubdomain("kosume.example.com")).toBe("kosume");
    });

    it("respects NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING=false flag", () => {
      process.env.NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING = "false";
      expect(extractSubdomain("kosume.localhost:3000")).toBeNull();
      expect(extractSubdomain("kosume.crodic.click")).toBeNull();
    });
  });

  describe("buildSubdomainUrl", () => {
    it("builds correct URL in local development", () => {
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = "localhost:3000";
      const requestUrl = new URL("http://localhost:3000/feed?tab=hot");
      const result = buildSubdomainUrl({
        subdomain: "kosume",
        path: "/feed",
        requestUrl,
      });

      expect(result.toString()).toBe(
        "http://kosume.localhost:3000/feed?tab=hot"
      );
    });

    it("builds correct URL in production", () => {
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = "crodic.click";
      const requestUrl = new URL("https://crodic.click/explore");
      const result = buildSubdomainUrl({
        subdomain: "kosume",
        path: "/explore",
        requestUrl,
      });

      expect(result.toString()).toBe("https://kosume.crodic.click/explore");
    });

    it("falls back to root URL when subdomain routing is disabled", () => {
      process.env.NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING = "false";
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = "crodic.click";
      const requestUrl = new URL("https://crodic.click/explore");
      const result = buildSubdomainUrl({
        subdomain: "kosume",
        path: "/explore",
        requestUrl,
      });

      expect(result.toString()).toBe("https://crodic.click/explore");
    });
  });

  describe("buildRootUrl", () => {
    it("builds root URL in local development", () => {
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = "localhost:3000";
      const requestUrl = new URL("http://kosume.localhost:3000/landing");
      const result = buildRootUrl({
        path: "/",
        requestUrl,
      });

      expect(result.toString()).toBe("http://localhost:3000/");
    });

    it("builds root URL in production", () => {
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = "crodic.click";
      const requestUrl = new URL("https://kosume.crodic.click/landing");
      const result = buildRootUrl({
        path: "/",
        requestUrl,
      });

      expect(result.toString()).toBe("https://crodic.click/");
    });
  });
});
