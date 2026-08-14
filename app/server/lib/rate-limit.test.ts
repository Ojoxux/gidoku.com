import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Hono } from "hono";
import { env } from "cloudflare:test";
import type { HonoContext } from "../../types/env";
import { rateLimiter } from "./rate-limit";
import { errorHandler } from "./errors";
import { createSession } from "./session";

describe("rateLimiter middleware", () => {
  const errorSpy = vi.spyOn(console, "error");

  beforeEach(() => {
    errorSpy.mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockReset();
  });

  it("should enforce the binding outcome", async () => {
    const limit = vi
      .fn<RateLimit["limit"]>()
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: false });
    const app = new Hono<HonoContext>();
    app.onError(errorHandler);
    app.use(
      "*",
      rateLimiter({
        binding: "API_RATE_LIMITER",
        limit: 1,
        period: 60,
      }),
    );
    app.get("/limited", (c) => c.json({ ok: true }));

    const testEnv = {
      ...env,
      API_RATE_LIMITER: { limit },
    };

    const first = await app.request(
      "/limited",
      { headers: { "CF-Connecting-IP": "1.1.1.1" } },
      testEnv,
    );
    expect(first.status).toBe(200);
    expect(first.headers.get("X-RateLimit-Limit")).toBe("1");
    expect(limit).toHaveBeenLastCalledWith({ key: "ip:1.1.1.1" });

    const second = await app.request(
      "/limited",
      { headers: { "CF-Connecting-IP": "1.1.1.1" } },
      testEnv,
    );
    expect(second.status).toBe(429);
    expect(second.headers.get("Retry-After")).toBe("60");
    expect(errorSpy).toHaveBeenCalled();
  });

  it("should prefer a validated session's user id over an IP address", async () => {
    const sessionId = await createSession(env.KV, "user-123");
    const limit = vi.fn<RateLimit["limit"]>().mockResolvedValue({ success: true });
    const app = new Hono<HonoContext>();
    app.use(
      "*",
      rateLimiter({
        binding: "API_RATE_LIMITER",
        limit: 60,
        period: 60,
      }),
    );
    app.get("/limited", (c) => c.json({ ok: true }));

    await app.request(
      "/limited",
      {
        headers: {
          Cookie: `session_id=${sessionId}`,
          "CF-Connecting-IP": "1.1.1.1",
        },
      },
      { ...env, API_RATE_LIMITER: { limit } },
    );

    expect(limit).toHaveBeenCalledWith({ key: "user:user-123" });
  });

  it("should fall back to an IP address when the session cookie is forged", async () => {
    const limit = vi.fn<RateLimit["limit"]>().mockResolvedValue({ success: true });
    const app = new Hono<HonoContext>();
    app.use(
      "*",
      rateLimiter({
        binding: "API_RATE_LIMITER",
        limit: 60,
        period: 60,
      }),
    );
    app.get("/limited", (c) => c.json({ ok: true }));

    await app.request(
      "/limited",
      {
        headers: {
          Cookie: "session_id=attacker-controlled-value",
          "CF-Connecting-IP": "1.1.1.1",
        },
      },
      { ...env, API_RATE_LIMITER: { limit } },
    );

    expect(limit).toHaveBeenCalledWith({ key: "ip:1.1.1.1" });
  });
});
