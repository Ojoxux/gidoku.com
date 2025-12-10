# gidoku.com

技術書に特化した読書管理 Web アプリケーション

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. データベースのセットアップ

#### ローカル開発環境

```bash
# セットアップ手順を確認
pnpm run db:setup

# マイグレーションを実行
pnpm run db:migrate:local

# サンプルデータを投入（オプション）
pnpm exec wrangler d1 execute gidoku-db --local --file=migrations/seed.sql
```

#### 本番環境

```bash
# D1データベースを作成（初回のみ）
pnpm exec wrangler d1 create gidoku-db

# wrangler.jsonc にdatabase_idを設定

# マイグレーションを実行
pnpm run db:migrate:prod
```

### 3. 環境変数の設定

`wrangler.jsonc` に以下を追加：

```jsonc
{
  "vars": {
    "APP_URL": "http://localhost:5173",
    "RAKUTEN_APP_ID": "your-rakuten-app-id"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "gidoku-db",
      "database_id": "your-database-id"
    }
  ]
  // 本番環境ではシークレットを使用
  // wrangler secret put GITHUB_CLIENT_SECRET
  // wrangler secret put GOOGLE_CLIENT_SECRET
  // wrangler secret put SESSION_SECRET
}
```

### 4. 開発サーバーの起動

```bash
pnpm run dev
```

ブラウザで http://localhost:5173 を開く

## 開発コマンド

```bash
# 開発サーバー起動
pnpm run dev

# ビルド
pnpm run build

# プレビュー（Wrangler Dev）
pnpm run preview

# デプロイ
pnpm run deploy

# データベース関連
pnpm run db:setup          # セットアップ手順を表示
pnpm run db:seed           # シードSQLを生成
pnpm run db:migrate:local  # ローカルマイグレーション
pnpm run db:migrate:prod   # 本番マイグレーション
```

## データベース操作

### テーブル一覧を確認

```bash
pnpm exec wrangler d1 execute gidoku-db --local --command="SELECT name FROM sqlite_master WHERE type='table'"
```

### データを確認

```bash
# ユーザー
pnpm exec wrangler d1 execute gidoku-db --local --command="SELECT * FROM users"

# 書籍
pnpm exec wrangler d1 execute gidoku-db --local --command="SELECT * FROM books"

# タグ
pnpm exec wrangler d1 execute gidoku-db --local --command="SELECT * FROM tags"
```

### データベースをリセット

```bash
# 全テーブルを削除
pnpm exec wrangler d1 execute gidoku-db --local --command="DROP TABLE IF EXISTS book_tags"
pnpm exec wrangler d1 execute gidoku-db --local --command="DROP TABLE IF EXISTS tags"
pnpm exec wrangler d1 execute gidoku-db --local --command="DROP TABLE IF EXISTS books"
pnpm exec wrangler d1 execute gidoku-db --local --command="DROP TABLE IF EXISTS sessions"
pnpm exec wrangler d1 execute gidoku-db --local --command="DROP TABLE IF EXISTS users"

# マイグレーションを再実行
pnpm run db:migrate:local

# サンプルデータを投入
pnpm exec wrangler d1 execute gidoku-db --local --file=migrations/seed.sql
```
