import type { Context, MiddlewareHandler, Next } from "hono";
import type { HonoContext } from "../../types/env";
import { RateLimitError } from "./errors";

interface RateLimitConfig {
  /** ウィンドウサイズ（秒） */
  windowSec: number;
  /** ウィンドウ内の最大リクエスト数 */
  limit: number;
  /** レート制限のキープレフィックス */
  keyPrefix: string;
  /** キー生成関数（デフォルト: IPアドレス） */
  keyGenerator?: (c: Context<HonoContext>) => string;
}

interface RateLimitEntry {
  /** ウィンドウ内のリクエスト数 */
  count: number;
  /** ウィンドウのリセット時間 */
  resetAt: number;
}

/**
 * レートリミット用ミドルウェア
 */
export function rateLimiter(
  config: RateLimitConfig
): MiddlewareHandler<HonoContext> {
  const {
    windowSec,
    limit,
    keyPrefix,
    keyGenerator = defaultKeyGenerator,
  } = config;

  return async (c: Context<HonoContext>, next: Next) => {
    const kv = c.env.KV;
    const identifier = keyGenerator(c);
    const key = `ratelimit:${keyPrefix}:${identifier}`;
    const now = Math.floor(Date.now() / 1000);

    // 現在のレート制限エントリを取得
    const entryJson = await kv.get(key);
    let entry: RateLimitEntry;

    if (entryJson) {
      entry = JSON.parse(entryJson);

      // ウィンドウがリセットされている場合
      if (now >= entry.resetAt) {
        entry = {
          count: 1,
          resetAt: now + windowSec,
        };
      } else {
        entry.count += 1;
      }
    } else {
      entry = {
        count: 1,
        resetAt: now + windowSec,
      };
    }

    // レート制限ヘッダーを設定
    const remaining = Math.max(0, limit - entry.count);
    const retryAfter = entry.resetAt - now;

    c.header("X-RateLimit-Limit", String(limit));
    c.header("X-RateLimit-Remaining", String(remaining));
    c.header("X-RateLimit-Reset", String(entry.resetAt));

    // 制限を超えている場合
    if (entry.count > limit) {
      c.header("Retry-After", String(retryAfter));
      throw new RateLimitError(
        "Too many requests. Please try again later.",
        retryAfter
      );
    }

    // エントリを更新（TTLをウィンドウサイズに設定）
    await kv.put(key, JSON.stringify(entry), {
      expirationTtl: windowSec + 1,
    });

    await next();
  };
}

/**
 * デフォルトのキー生成関数
 */
function defaultKeyGenerator(c: Context<HonoContext>): string {
  // CF-Connecting-IP ヘッダーでクライアントIPを取得
  const ip =
    c.req.header("CF-Connecting-IP") ||
    c.req.header("X-Forwarded-For")?.split(",")[0]?.trim() ||
    c.req.header("X-Real-IP") ||
    "unknown";

  return ip;
}

/**
 * 認証用のRate Limiter設定(15分間で100リクエストまで)
 */
export const authRateLimiter = rateLimiter({
  windowSec: 15 * 60, // 15分
  limit: 100,
  keyPrefix: "auth",
});

/**
 * 検索API用のRate Limiter設定(1分間で30リクエストまで)
 */
export const searchRateLimiter = rateLimiter({
  windowSec: 60, // 1分
  limit: 30,
  keyPrefix: "search",
});

/**
 * 一般API用のRate Limiter設定(1分間で60リクエストまで)
 */
export const apiRateLimiter = rateLimiter({
  windowSec: 60, // 1分
  limit: 60,
  keyPrefix: "api",
});
