import type { D1Database, KVNamespace } from "@cloudflare/workers-types";

export interface Env {
  // Cloudflare Bindings
  DB: D1Database; // D1データベース
  KV: KVNamespace; // KVストア（セッション管理用）

  // 外部API
  RAKUTEN_APP_ID: string; // 楽天アプリケーションID

  // OAuth
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;

  // セキュリティ
  SESSION_SECRET: string; // セッション暗号化キー

  // アプリケーション設定
  APP_URL: string; // アプリケーションのベースURL（例: https://gidoku.com）
}
