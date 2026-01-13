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

#### 本番環境
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

## ちょくちょく使う開発コマンド

```bash
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
