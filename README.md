# gidoku.com

技術書に特化した読書管理 Web アプリケーション

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Ojoxux/gidoku.com)

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
