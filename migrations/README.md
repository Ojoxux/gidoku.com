# Database Migrations

## マイグレーション一覧

| ファイル                  | 説明                                          |
| ------------------------- | --------------------------------------------- |
| `0001_initial_schema.sql` | 初期スキーマ（users, books, tags, book_tags） |
| `0002_add_sessions.sql`   | セッション管理テーブル                        |

## セットアップ手順

### 1. D1 データベースを作成

```bash
# ローカル開発用
wrangler d1 create gidoku-db --local

# 本番用
wrangler d1 create gidoku-db
```

### 2. wrangler.jsonc に設定を追加

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "gidoku-db",
      "database_id": "<本番用のID>"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "<KV Namespace ID>"
    }
  ]
}
```

### 3. マイグレーションを実行

```bash
# ローカル環境
wrangler d1 execute gidoku-db --local --file=migrations/0001_initial_schema.sql
wrangler d1 execute gidoku-db --local --file=migrations/0002_add_sessions.sql

# 本番環境
wrangler d1 execute gidoku-db --file=migrations/0001_initial_schema.sql
wrangler d1 execute gidoku-db --file=migrations/0002_add_sessions.sql
```

### 4. サンプルデータを投入（Optional）

```bash
# セットアップスクリプトを実行してSQLを生成
pnpm run db:seed

# 生成されたSQLを実行
wrangler d1 execute gidoku-db --local --file=migrations/seed.sql
```

## 便利なコマンド

### データベースの状態を確認

```bash
# ローカル
wrangler d1 execute gidoku-db --local --command="SELECT name FROM sqlite_master WHERE type='table'"

# テーブルの内容を確認
wrangler d1 execute gidoku-db --local --command="SELECT * FROM users"
```

### データベースをリセット

```bash
# 全テーブルを削除
wrangler d1 execute gidoku-db --local --command="DROP TABLE IF EXISTS book_tags"
wrangler d1 execute gidoku-db --local --command="DROP TABLE IF EXISTS tags"
wrangler d1 execute gidoku-db --local --command="DROP TABLE IF EXISTS books"
wrangler d1 execute gidoku-db --local --command="DROP TABLE IF EXISTS sessions"
wrangler d1 execute gidoku-db --local --command="DROP TABLE IF EXISTS users"

# マイグレーションを再実行
wrangler d1 execute gidoku-db --local --file=migrations/0001_initial_schema.sql
wrangler d1 execute gidoku-db --local --file=migrations/0002_add_sessions.sql
```

## マイグレーションの追加方法

1. 新しいマイグレーションファイルを作成（連番を付ける）

```bash
touch migrations/0003_add_new_feature.sql
```

2. SQL を記述

```sql
-- Migration: 0003_add_new_feature
-- Description: 新機能の説明
-- Created: YYYY-MM-DD

ALTER TABLE books ADD COLUMN new_column TEXT;
```

3. マイグレーションを実行

```bash
wrangler d1 execute gidoku-db --local --file=migrations/0003_add_new_feature.sql
```

## 注意事項

- マイグレーションは**一方向のみ**（ロールバック機能なし）
- 本番環境での実行は慎重に
- 大きな変更は段階的に実施
- バックアップを取ってから実行

## トラブルシューティング

### "database is locked" エラー

```bash
# 開発サーバーを停止してから実行
pkill -f wrangler
wrangler d1 execute gidoku-db --local --file=migrations/xxxx.sql
```

### テーブルが見つからない

```bash
# テーブル一覧を確認
wrangler d1 execute gidoku-db --local --command="SELECT name FROM sqlite_master WHERE type='table'"
```

### マイグレーションの順序を間違えた

```bash
# データベースをリセットして最初から実行
# 上記の「データベースをリセット」を参照
```
