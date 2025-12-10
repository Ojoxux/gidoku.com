# gidoku.com MVP 設計書

## 概要

技術書に特化した読書管理 Web アプリケーション

**コンセプト**: 技術書の読書履歴を記録・管理し、学習の進捗を可視化する。読んだ本を公開プロフィールとして共有することもできる。

## 技術スタック

| 項目           | 技術                     |
| -------------- | ------------------------ |
| フレームワーク | HonoX + Hono             |
| インフラ       | Cloudflare Workers       |
| データベース   | Cloudflare D1 (SQLite)   |
| スタイリング   | Tailwind CSS（素のまま） |
| 認証           | OAuth (GitHub / Google)  |
| 書籍情報 API   | 楽天ブックス API         |

## MVP スコープ

### 含める機能

- OAuth 認証（GitHub / Google）
- 書籍登録（タイトル検索 + ISBN 直接指定）
- 書籍情報の自動取得（楽天ブックス API）
- 書籍一覧・検索・並び替え
- ページ数ベースの進捗管理
- 3 ステータス管理（積読 / 読書中 / 読了）
- ユーザー定義タグ
- メモ機能
- 公開プロフィールページ（任意で読了本 + 読書中の本を共有）
- レスポンシブ対応（デスクトップ優先、モバイルは最低限）

### 含めない機能（将来対応）

- 章/節単位の進捗管理
- 技術概念ノート（Concept Map）
- 理解度メーター
- 学習効率ダッシュボード
- レコメンド機能
- ソーシャル機能（フォロー・レビュー共有）

## データモデル

### users（ユーザー）

| カラム      | 型   | 説明                                  |
| ----------- | ---- | ------------------------------------- |
| id          | TEXT | プライマリキー（UUID）                |
| username    | TEXT | ユーザー名（ユニーク、公開 URL 用）   |
| email       | TEXT | メールアドレス                        |
| name        | TEXT | 表示名                                |
| bio         | TEXT | 自己紹介（公開プロフィール用）        |
| avatar_url  | TEXT | アバター画像 URL                      |
| provider    | TEXT | OAuth プロバイダー（github / google） |
| provider_id | TEXT | プロバイダー側のユーザー ID           |
| created_at  | TEXT | 作成日時                              |
| updated_at  | TEXT | 更新日時                              |

### books（書籍）

| カラム                | 型      | 説明                                       |
| --------------------- | ------- | ------------------------------------------ |
| id                    | TEXT    | プライマリキー（UUID）                     |
| user_id               | TEXT    | 外部キー（users.id）                       |
| rakuten_books_id      | TEXT    | 楽天ブックスの ID（NULL 許可）             |
| title                 | TEXT    | タイトル                                   |
| authors               | TEXT    | 著者（JSON 配列）                          |
| publisher             | TEXT    | 出版社                                     |
| published_date        | TEXT    | 出版日                                     |
| isbn                  | TEXT    | ISBN（ISBN-10 または ISBN-13）             |
| page_count            | INTEGER | 総ページ数                                 |
| description           | TEXT    | 概要                                       |
| thumbnail_url         | TEXT    | 表紙画像 URL                               |
| rakuten_affiliate_url | TEXT    | 楽天アフィリエイト URL（NULL 許可）        |
| status                | TEXT    | ステータス（unread / reading / completed） |
| current_page          | INTEGER | 現在のページ数（デフォルト: 0）            |
| memo                  | TEXT    | メモ                                       |
| finished_at           | TEXT    | 読了日                                     |
| created_at            | TEXT    | 作成日時                                   |
| updated_at            | TEXT    | 更新日時                                   |

### tags（タグ）

| カラム     | 型   | 説明                   |
| ---------- | ---- | ---------------------- |
| id         | TEXT | プライマリキー（UUID） |
| user_id    | TEXT | 外部キー（users.id）   |
| name       | TEXT | タグ名                 |
| created_at | TEXT | 作成日時               |

### book_tags（書籍-タグ中間テーブル）

| カラム  | 型   | 説明                 |
| ------- | ---- | -------------------- |
| book_id | TEXT | 外部キー（books.id） |
| tag_id  | TEXT | 外部キー（tags.id）  |

## 画面一覧

### 認証

- `/login` - ログイン画面（GitHub / Google ボタン）
- `/auth/callback` - OAuth コールバック

### メイン機能

- `/` - ダッシュボード（読書中の本、最近追加した本）
- `/books` - 書籍一覧（検索・フィルタ・並び替え）
- `/books/new` - 書籍登録（検索して追加 or 手動入力）
- `/books/:id` - 書籍詳細（進捗更新、メモ編集、タグ管理）
- `/books/:id/edit` - 書籍編集

### 公開プロフィール

- `/@:username` - 公開プロフィールページ（読了本 + 読書中の本を表示）

### 設定

- `/settings` - ユーザー設定（プロフィール編集、ユーザー名変更）

## API エンドポイント

### 認証

- `GET /auth/github` - GitHub OAuth 開始
- `GET /auth/github/callback` - GitHub OAuth コールバック
- `GET /auth/google` - Google OAuth 開始
- `GET /auth/google/callback` - Google OAuth コールバック
- `POST /auth/logout` - ログアウト

### 書籍

- `GET /api/books` - 書籍一覧取得
- `POST /api/books` - 書籍登録
- `GET /api/books/:id` - 書籍詳細取得
- `PUT /api/books/:id` - 書籍更新
- `DELETE /api/books/:id` - 書籍削除
- `PATCH /api/books/:id/progress` - 進捗更新

### タグ

- `GET /api/tags` - タグ一覧取得
- `POST /api/tags` - タグ作成
- `DELETE /api/tags/:id` - タグ削除
- `POST /api/books/:id/tags` - 書籍にタグ追加
- `DELETE /api/books/:id/tags/:tagId` - 書籍からタグ削除

### ユーザー

- `GET /api/users/:username` - 公開プロフィール取得
- `PUT /api/users/me` - 自分のプロフィール更新
- `GET /api/users/:username/books` - ユーザーの公開書籍一覧

### 外部 API

- `GET /api/search/books?q=` - 楽天ブックス API で書籍検索

## 書籍登録フロー

1. ユーザーがタイトルまたは ISBN を入力
2. 楽天ブックス API で検索
3. 候補一覧を表示
4. ユーザーが選択
5. 書籍情報を自動入力（編集可能）
6. ステータス・タグを設定
7. 保存

### 楽天ブックス API について

- 楽天ブックス書籍検索 API を使用
- タイトル検索、ISBN 検索に対応
- 取得できる情報：タイトル、著者、出版社、ISBN、ページ数、表紙画像、商品説明など
- アフィリエイト URL も取得可能（将来的な収益化に対応）

## 進捗管理

- 現在ページ数を入力
- 進捗率は自動計算（current_page / page_count \* 100）
- ステータスは手動切り替え
  - 積読（unread）: まだ読み始めていない
  - 読書中（reading）: 読んでいる途中
  - 読了（completed）: 読み終わった

## 公開プロフィール

読書記録を他の人と共有したい場合に利用できる**オプション機能**。

### URL 形式

`gidoku.com/@username`

### 表示内容

- ユーザー名・表示名
- 自己紹介（bio）
- アバター画像
- 読了本の一覧（表紙・タイトル・著者・読了日）
- 読書中の本の一覧（表紙・タイトル・著者・進捗率）
- 統計情報（読了冊数、読書中の冊数）

### 公開範囲

- 読了（completed）と読書中（reading）のステータスの本のみ公開
- 積読（unread）は非公開
- ※将来的には公開/非公開を書籍ごとに設定できるようにする

## デザイン方針

- Tailwind CSS で自前スタイリング
- デスクトップ優先、モバイルは崩れない程度に対応
- シンプルで見やすい UI
- ダークモードは後回し（将来対応）

## 将来の拡張

1. **読書量ヒートマップ** - GitHub の草のような読書活動の可視化
2. **章/節単位の進捗管理** - ユーザーが自由形式で章を追加
3. **技術概念ノート** - 概念単位でメモ、複数書籍との関連付け
4. **理解度メーター** - 章ごとの理解度入力
5. **学習効率ダッシュボード** - 読書時間、技術領域の偏り分析
6. **タグベースレコメンド** - 共通タグから関連本を推薦
7. **エクスポート機能** - PDF/Markdown/JSON で履歴出力
8. **ソーシャル機能** - 他ユーザーの本棚閲覧、レビュー共有
