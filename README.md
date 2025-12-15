# gidoku.com

技術書に特化した読書管理 Web アプリケーション

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

```bash
cp .dev.vars.example .dev.vars
```

#### 以下の値を設定してください：

- **RAKUTEN_APP_ID**
- **GITHUB_CLIENT_ID / SECRET / CallbackURL**
- **GOOGLE_CLIENT_ID / SECRET / CallbackURL**

### 3. データベースのセットアップ

#### ローカル開発環境

初回起動時は、マイグレーションを実行してデータベースを作成します：

```bash
pnpm run db:migrate:local
```

テーブルが作成されたか確認：

```bash
pnpm exec wrangler d1 execute gidoku-db --local --command="SELECT name FROM sqlite_master WHERE type='table'"
```

（オプション）サンプルデータを投入：

```bash
pnpm exec wrangler d1 execute gidoku-db --local --file=migrations/seed.sql
```

#### 本番環境

本番環境の D1 データベースと KV ネームスペースは `wrangler.jsonc` に設定済みです。
初回デプロイ前に、本番データベースのマイグレーションを実行してください：

```bash
pnpm run db:migrate:prod
```

### 4. 開発サーバーの起動

```bash
pnpm run dev
```

ブラウザで http://localhost:5173 を開く

## 本番環境へのデプロイ

### シークレットの設定

```bash
# GitHub OAuth
wrangler secret put GITHUB_CLIENT_SECRET

# Google OAuth
wrangler secret put GOOGLE_CLIENT_SECRET

# セッションシークレット
wrangler secret put SESSION_SECRET

# 楽天API（varsでも可）
wrangler secret put RAKUTEN_APP_ID
```

### デプロイ

```bash
pnpm run deploy
```

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
