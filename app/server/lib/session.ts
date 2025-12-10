import type { KVNamespace } from "@cloudflare/workers-types";
import { UnauthorizedError } from "./errors";

export const SESSION_TTL = 60 * 60 * 24 * 7;

const SESSION_PREFIX = "session:";

/**
 * セッションCookieの設定オプション
 */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true, // 本番環境ではHTTPSを使用
  sameSite: "Lax" as const,
  path: "/",
  maxAge: SESSION_TTL,
};

/**
 * セッションを作成
 */
export async function createSession(
  kv: KVNamespace,
  userId: string,
  ttl: number = SESSION_TTL
): Promise<string> {
  const sessionId = crypto.randomUUID();
  const key = `${SESSION_PREFIX}${sessionId}`;

  await kv.put(key, userId, {
    expirationTtl: ttl,
  });

  return sessionId;
}

/**
 * セッションを取得
 */
export async function getSession(
  kv: KVNamespace,
  sessionId: string
): Promise<string | null> {
  const key = `${SESSION_PREFIX}${sessionId}`;
  return await kv.get(key);
}

/**
 * セッションを検証してユーザーIDを取得（存在しない場合はエラー）
 */
export async function validateSession(
  kv: KVNamespace,
  sessionId: string
): Promise<string> {
  const userId = await getSession(kv, sessionId);

  if (!userId) {
    throw new UnauthorizedError("Invalid or expired session");
  }

  return userId;
}

/**
 * セッションを削除
 */
export async function deleteSession(
  kv: KVNamespace,
  sessionId: string
): Promise<void> {
  const key = `${SESSION_PREFIX}${sessionId}`;
  await kv.delete(key);
}

/**
 * セッションを更新
 */
export async function refreshSession(
  kv: KVNamespace,
  sessionId: string,
  ttl: number = SESSION_TTL
): Promise<void> {
  const userId = await getSession(kv, sessionId);

  if (!userId) {
    throw new UnauthorizedError("Session not found");
  }

  const key = `${SESSION_PREFIX}${sessionId}`;
  await kv.put(key, userId, {
    expirationTtl: ttl,
  });
}

/**
 * ユーザーの全セッションを削除（ログアウト時など）
 */
export async function deleteAllUserSessions(
  kv: KVNamespace,
  sessionIds: string[]
): Promise<void> {
  const deletePromises = sessionIds.map((sessionId) =>
    deleteSession(kv, sessionId)
  );
  await Promise.all(deletePromises);
}
