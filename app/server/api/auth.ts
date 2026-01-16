import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import type { HonoContext } from "../../types/env";
import { userRepo } from "../db/repositories";
import { authMiddleware } from "../lib/auth";
import { validator, getValidated } from "../lib/validator";
import { oauthProviderSchema, oauthCallbackSchema } from "./schemas";
import type { OAuthProvider, OAuthCallbackInput } from "./schemas/auth";
import {
  createSession,
  deleteSession,
  SESSION_COOKIE_OPTIONS,
} from "../lib/session";
import { toUserResponse } from "../lib/mapper";
import { successResponse, errorResponse } from "../lib/response";
import * as oauthService from "../services/oauth";
import { getCookie } from "hono/cookie";

const app = new Hono<HonoContext>();

/**
 * OAuth認証開始
 * GET /api/auth/:provider
 */
app.get("/:provider", validator("param", oauthProviderSchema), async (c) => {
  const provider = c.req.param("provider") as OAuthProvider;
  const state = crypto.randomUUID();

  // stateをセッションに保存（CSRF対策）
  await c.env.KV.put(`oauth_state:${state}`, provider, {
    expirationTtl: 600,
  });

  const authUrl = oauthService.getAuthUrl(provider, state, c.env);

  return c.redirect(authUrl);
});

/**
 * OAuthコールバック
 * GET /api/auth/:provider/callback
 */
app.get(
  "/:provider/callback",
  validator("param", oauthProviderSchema),
  validator("query", oauthCallbackSchema),
  async (c) => {
    const provider = c.req.param("provider") as OAuthProvider;
    const { code, state } = getValidated<OAuthCallbackInput>(c, "query");

    // state検証（CSRF対策）
    const savedProvider = await c.env.KV.get(`oauth_state:${state}`);
    if (savedProvider !== provider) {
      return errorResponse(c, "Invalid state", "INVALID_STATE", 400);
    }
    await c.env.KV.delete(`oauth_state:${state}`);

    try {
      // アクセストークン取得
      const accessToken = await oauthService.getAccessToken(
        provider,
        code,
        c.env
      );

      // ユーザー情報取得
      const oauthUser = await oauthService.getUser(provider, accessToken);

      // 既存ユーザー検索
      let user = await userRepo.findByProvider(
        c.env.DB,
        provider,
        oauthUser.providerId
      );

      if (!user) {
        // 新規ユーザー作成
        const now = new Date().toISOString();
        user = await userRepo.create(c.env.DB, {
          id: crypto.randomUUID(),
          username: await generateUniqueUsername(c.env.DB, oauthUser.username),
          email: oauthUser.email,
          name: oauthUser.name,
          bio: oauthUser.bio || null,
          avatar_url: oauthUser.avatarUrl || null,
          provider,
          provider_id: oauthUser.providerId,
          created_at: now,
          updated_at: now,
        });
      }

      // セッション作成
      const sessionId = await createSession(c.env.KV, user.id);

      // Cookie設定
      setCookie(c, "session_id", sessionId, SESSION_COOKIE_OPTIONS);

      // フロントエンドへリダイレクト
      return c.redirect(`${c.env.APP_URL}/`);
    } catch (error) {
      console.error("OAuth error:", error);
      return c.redirect(`${c.env.APP_URL}/login?error=auth_failed`);
    }
  }
);

/**
 * ログアウト
 * POST /api/auth/logout
 */
app.post("/logout", authMiddleware, async (c) => {
  const sessionId = getCookie(c, "session_id");

  if (sessionId) {
    await deleteSession(c.env.KV, sessionId);
  }

  deleteCookie(c, "session_id", { path: "/" });

  return successResponse(c, { loggedOut: true });
});

/**
 * セッション確認
 * GET /api/auth/session
 */
app.get("/session", authMiddleware, async (c) => {
  const user = c.get("user");
  return successResponse(c, {
    authenticated: true,
    user: toUserResponse(user),
  });
});

/**
 * ユニークなユーザー名を生成
 */
async function generateUniqueUsername(
  db: D1Database,
  baseUsername: string
): Promise<string> {
  // 無効な文字を除去
  let username = baseUsername.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 20);

  if (username.length < 3) {
    username = "user";
  }

  let candidate = username;
  let counter = 1;

  while (await userRepo.isUsernameTaken(db, candidate)) {
    candidate = `${username}${counter}`;
    counter++;
    if (counter > 1000) {
      // 無限ループ防止
      candidate = `${username}${Date.now()}`;
      break;
    }
  }

  return candidate;
}

export default app;
