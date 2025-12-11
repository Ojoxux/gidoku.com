-- Migration: 0002_add_sessions
-- Description: セッション管理テーブル追加（KVの代替またはバックアップ用）
-- Created: 2025-12-10

-- セッションテーブル（オプション: KVを使う場合は不要）
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- セッションテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);


