import type { Context, MiddlewareHandler, Next } from "hono";
import { getCookie } from "hono/cookie";
import type { HonoContext } from "../../types/env";
import { RateLimitError } from "./errors";

interface RateLimitConfig {
  /** Wranglerで設定したRate Limiting binding名 */
  binding: "AUTH_RATE_LIMITER" | "SEARCH_RATE_LIMITER" | "API_RATE_LIMITER";
  /** ウィンドウ内の最大リクエスト数 */
  limit: number;
  /** ウィンドウサイズ（秒） */
  period: 10 | 60;
  /** キー生成関数（デフォルト: セッションID、未認証時はIPアドレス） */
  keyGenerator?: (c: Context<HonoContext>) => string;
}

/**
 * Cloudflare Rate Limiting binding用ミドルウェア
 */
export function rateLimiter(config: RateLimitConfig): MiddlewareHandler<HonoContext> {
  const { binding, limit, period, keyGenerator = defaultKeyGenerator } = config;

  return async (c: Context<HonoContext>, next: Next) => {
    const rateLimit = c.env[binding];
    const { success } = await rateLimit.limit({ key: keyGenerator(c) });

    c.header("X-RateLimit-Limit", String(limit));

    if (!success) {
      c.header("Retry-After", String(period));
      throw new RateLimitError("Too many requests. Please try again later.", period);
    }

    await next();
  };
}

/**
 * デフォルトのキー生成関数
 */
function defaultKeyGenerator(c: Context<HonoContext>): string {
  const sessionId = getCookie(c, "session_id");
  if (sessionId) {
    return `session:${sessionId}`;
  }

  const ip =
    c.req.header("CF-Connecting-IP") ||
    c.req.header("X-Forwarded-For")?.split(",")[0]?.trim() ||
    c.req.header("X-Real-IP") ||
    "unknown";

  return `ip:${ip}`;
}

/**
 * 認証済みユーザーのキー生成関数
 */
function authenticatedUserKeyGenerator(c: Context<HonoContext>): string {
  const userId = c.get("userId");
  return userId ? `user:${userId}` : defaultKeyGenerator(c);
}

/**
 * 認証用のRate Limiter設定(1分間で10リクエストまで)
 */
export const authRateLimiter = rateLimiter({
  binding: "AUTH_RATE_LIMITER",
  limit: 10,
  period: 60,
});

/**
 * 検索API用のRate Limiter設定(1分間で30リクエストまで)
 */
export const searchRateLimiter = rateLimiter({
  binding: "SEARCH_RATE_LIMITER",
  limit: 30,
  period: 60,
  keyGenerator: authenticatedUserKeyGenerator,
});

/**
 * 一般API用のRate Limiter設定(1分間で60リクエストまで)
 */
export const apiRateLimiter = rateLimiter({
  binding: "API_RATE_LIMITER",
  limit: 60,
  period: 60,
});
