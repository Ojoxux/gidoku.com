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

## 本番環境へのデプロイ

[mimifuwa.cc](https://github.com/mimifuwacc/mimifuwa.cc) と同様に、`staging` で開発してリリース PR 経由で `main` に入れたときだけ本番デプロイします。

### リリースの流れ

1. 機能ブランチを `staging` にマージする
   - **Staging Preview** … staging 環境へデプロイ
   - **Create Release Pull Request** … `staging` → `main` のリリース PR を自動作成・更新
2. リリース PR で変更内容を確認し、`staging` での動作チェックを済ませる
3. リリース PR を `main` にマージする
   - **Deploy and Release** … 本番デプロイ + タイムスタンプ付き GitHub Release 作成

### 初回セットアップ（リポジトリ管理者向け）

1. Cloudflare Dashboard の Workers Builds で **Git リポジトリの接続を Disconnect** する
2. GitHub リポジトリの Secrets に以下を登録する
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. `staging` ブランチを作成し、以降の開発は `staging` 向けに行う
4. `wrangler.staging.jsonc` の D1 / KV ID を staging 用リソースの値に差し替える

### Wrangler シークレットの設定

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

### 手動デプロイ（緊急時のみ）

```bash
pnpm run deploy
```

または GitHub Actions の **Deploy and Release** workflow を `workflow_dispatch` で手動実行します。

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
