import type { Env } from "../../types/env";
import { ExternalApiError } from "../lib/errors";

export interface OAuthUser {
  provider: "github" | "google";
  providerId: string;
  email: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
}

/**
 * OAuth認証URLを生成
 */
export function getAuthUrl(
  provider: "github" | "google",
  state: string,
  env: Env
): string {
  const redirectUri = `${env.APP_URL}/api/auth/${provider}/callback`;

  if (provider === "github") {
    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: "read:user user:email",
      state,
    });
    return `https://github.com/login/oauth/authorize?${params}`;
  }

  if (provider === "google") {
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "offline",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  throw new ExternalApiError(`Unknown provider: ${provider}`);
}

/**
 * アクセストークンを取得
 */
export async function getAccessToken(
  provider: "github" | "google",
  code: string,
  env: Env
): Promise<string> {
  const redirectUri = `${env.APP_URL}/api/auth/${provider}/callback`;

  if (provider === "github") {
    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri,
        }),
      }
    );

    if (!response.ok) {
      throw new ExternalApiError("Failed to get GitHub access token", "GitHub");
    }

    const data = await response.json() as { access_token?: string; error?: string };

    if (data.error || !data.access_token) {
      throw new ExternalApiError(
        data.error || "No access token received",
        "GitHub"
      );
    }

    return data.access_token;
  }

  if (provider === "google") {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      throw new ExternalApiError("Failed to get Google access token", "Google");
    }

    const data = await response.json() as { access_token?: string; error?: string };

    if (data.error || !data.access_token) {
      throw new ExternalApiError(
        data.error || "No access token received",
        "Google"
      );
    }

    return data.access_token;
  }

  throw new ExternalApiError(`Unknown provider: ${provider}`);
}

/**
 * ユーザー情報を取得
 */
export async function getUser(
  provider: "github" | "google",
  accessToken: string
): Promise<OAuthUser> {
  if (provider === "github") {
    return getGitHubUser(accessToken);
  }

  if (provider === "google") {
    return getGoogleUser(accessToken);
  }

  throw new ExternalApiError(`Unknown provider: ${provider}`);
}

/**
 * GitHub ユーザー情報取得
 */
async function getGitHubUser(accessToken: string): Promise<OAuthUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "User-Agent": "gidoku-app",
    },
  });

  if (!response.ok) {
    throw new ExternalApiError("Failed to fetch GitHub user", "GitHub");
  }

  const data = await response.json() as {
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url: string;
    bio: string | null;
  };

  // メールが非公開の場合、別途取得
  let email = data.email;
  if (!email) {
    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "User-Agent": "gidoku-app",
      },
    });

    if (emailResponse.ok) {
      const emails = await emailResponse.json() as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      const primaryEmail = emails.find((e) => e.primary && e.verified);
      email = primaryEmail?.email || emails[0]?.email || null;
    }
  }

  if (!email) {
    throw new ExternalApiError("Could not get email from GitHub", "GitHub");
  }

  return {
    provider: "github",
    providerId: String(data.id),
    email,
    name: data.name || data.login,
    username: data.login,
    avatarUrl: data.avatar_url,
    bio: data.bio,
  };
}

/**
 * Google ユーザー情報取得
 */
async function getGoogleUser(accessToken: string): Promise<OAuthUser> {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new ExternalApiError("Failed to fetch Google user", "Google");
  }

  const data = await response.json() as {
    id: string;
    email: string;
    name: string;
    picture: string;
  };

  return {
    provider: "google",
    providerId: data.id,
    email: data.email,
    name: data.name,
    username: data.email.split("@")[0], // メールのローカル部分をユーザー名に
    avatarUrl: data.picture,
    bio: null,
  };
}

