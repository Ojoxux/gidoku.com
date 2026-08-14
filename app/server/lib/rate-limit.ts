import type { Context, MiddlewareHandler, Next } from "hono";
import { getCookie } from "hono/cookie";
import type { HonoContext } from "../../types/env";
import { RateLimitError } from "./errors";
import { validateSession } from "./session";

interface RateLimitConfig {
  /** Wranglerで設定したRate Limiting binding名 */
  binding: "AUTH_RATE_LIMITER" | "SEARCH_RATE_LIMITER" | "API_RATE_LIMITER";
  /** ウィンドウ内の最大リクエスト数 */
  limit: number;
  /** ウィンドウサイズ（秒） */
  period: 10 | 60;
  /** キー生成関数（デフォルト: 検証済みユーザーID、未認証時はIPアドレス） */
  keyGenerator?: (c: Context<HonoContext>) => string | Promise<string>;
}

/**
 * Cloudflare Rate Limiting binding用ミドルウェア
 */
export function rateLimiter(config: RateLimitConfig): MiddlewareHandler<HonoContext> {
  const { binding, limit, period, keyGenerator = defaultKeyGenerator } = config;

  return async (c: Context<HonoContext>, next: Next) => {
    const rateLimit = c.env[binding];
    const key = await keyGenerator(c);
    const { success } = await rateLimit.limit({ key });

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
 *
 * session_idクッキーはクライアントが自由に設定できるため、
 * 生の値をキーに使うとレート制限を回避できてしまう。
 * 必ずKVで検証し、検証済みのユーザーIDのみをキーに採用する。
 * 検証結果はコンテキストに残し、後続のauthMiddleware/optionalAuthMiddlewareが
 * 同じセッションをKVへ再度問い合わせずに済むようにする。
 */
async function defaultKeyGenerator(c: Context<HonoContext>): Promise<string> {
  const sessionId = getCookie(c, "session_id");
  if (sessionId) {
    try {
      const userId = await validateSession(c.env.KV, sessionId);
      c.set("userId", userId);
      return `user:${userId}`;
    } catch {
      // 無効・期限切れのセッションはIPアドレスにフォールバック
    }
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
async function authenticatedUserKeyGenerator(c: Context<HonoContext>): Promise<string> {
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
