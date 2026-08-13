import { afterEach, describe, expect, it, vi } from "vitest";
import { env } from "cloudflare:test";
import { Hono } from "hono";
import type { HonoContext } from "../../types/env";
import api from ".";

describe("API rate limiting", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["/api/books", "198.51.100.11"],
    ["/api/tags", "198.51.100.12"],
    ["/api/users/check/rate-limit-test", "198.51.100.13"],
  ])("applies the general API policy to %s", async (path, ip) => {
    const app = new Hono<HonoContext>();
    app.route("/api", api);

    const response = await app.request(path, { headers: { "CF-Connecting-IP": ip } }, env);

    expect(response.headers.get("X-RateLimit-Limit")).toBe("60");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("59");
  });

  it("keeps health checks outside the general API policy", async () => {
    const app = new Hono<HonoContext>();
    app.route("/api", api);

    const response = await app.request("/api/health", {}, env);

    expect(response.status).toBe(200);
    expect(response.headers.get("X-RateLimit-Limit")).toBeNull();
  });

  it("keeps the dedicated auth policy", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const app = new Hono<HonoContext>();
    app.route("/api", api);

    const response = await app.request(
      "/api/auth/session",
      { headers: { "CF-Connecting-IP": "203.0.113.101" } },
      env,
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("X-RateLimit-Limit")).toBe("100");
  });
});
