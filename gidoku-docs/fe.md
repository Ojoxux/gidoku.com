## gidoku.com のコンポーネント分割

### ディレクトリ構造

```
app/
├── routes/              # HonoXのルーティング（既存）
│   ├── index.tsx
│   ├── login.tsx
│   ├── books/
│   │   ├── index.tsx
│   │   ├── new.tsx
│   │   └── [id]/
│   │       ├── index.tsx
│   │       └── edit.tsx
│   ├── settings.tsx
│   └── @[username].tsx  # 公開プロフィール
│
├── islands/             # インタラクティブなコンポーネント（クライアントサイド）
│   ├── BookSearchForm.tsx
│   ├── ProgressSlider.tsx
│   ├── TagInput.tsx
│   ├── BookStatusToggle.tsx
│   ├── MemoEditor.tsx
│   └── BookFilter.tsx
│
├── components/          # 共通UIコンポーネント（サーバーサイド）
│   ├── ui/             # 基本的なUIコンポーネント（Atomic Design: Atoms）
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   └── ProgressBar.tsx
│   │
│   ├── layout/         # レイアウトコンポーネント
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── Container.tsx
│   │
│   ├── book/           # 書籍関連コンポーネント（Molecules/Organisms）
│   │   ├── BookCard.tsx
│   │   ├── BookList.tsx
│   │   ├── BookCover.tsx
│   │   ├── BookMeta.tsx
│   │   ├── BookProgress.tsx
│   │   └── BookSearchResult.tsx
│   │
│   ├── user/           # ユーザー関連コンポーネント
│   │   ├── UserProfile.tsx
│   │   ├── UserStats.tsx
│   │   └── UserAvatar.tsx
│   │
│   └── common/         # その他共通コンポーネント
│       ├── EmptyState.tsx
│       ├── LoadingSpinner.tsx
│       ├── ErrorMessage.tsx
│       └── Modal.tsx
│
├── lib/                # ユーティリティ・ヘルパー
│   ├── api/
│   │   ├── books.ts
│   │   ├── tags.ts
│   │   ├── users.ts
│   │   └── rakuten.ts
│   ├── db/
│   │   └── schema.ts
│   ├── auth/
│   │   └── session.ts
│   └── utils/
│       ├── date.ts
│       ├── progress.ts
│       └── validation.ts
│
├── types/              # TypeScript型定義
│   ├── book.ts
│   ├── user.ts
│   ├── tag.ts
│   └── api.ts
│
└── hooks/              # カスタムフック（Islands内で使用）
    ├── useBookSearch.ts
    ├── useDebounce.ts
    └── useLocalStorage.ts
```

### コンポーネント分割の設計原則

#### 1. **Islands vs Components の使い分け**

**Islands（`app/islands/`）**

- ユーザーインタラクションが必要なコンポーネント
- クライアントサイドで動作（JavaScript が必要）
- 例：フォーム、検索、スライダー、リアルタイム更新

**Components（`app/components/`）**

- 静的な表示コンポーネント
- サーバーサイドレンダリング
- 例：カード、リスト、レイアウト

#### 2. **階層別の責務**

**UI 層（`components/ui/`）**

- 最小単位の再利用可能なコンポーネント
- プロジェクト固有のロジックを含まない
- 汎用的な props インターフェース

**ドメイン層（`components/book/`, `components/user/`）**

- 特定のドメインに特化したコンポーネント
- ビジネスロジックを含む
- UI 層のコンポーネントを組み合わせて構築

**レイアウト層（`components/layout/`）**

- ページ全体の構造を定義
- ナビゲーション、ヘッダー、フッターなど

#### 3. **具体的なコンポーネント例**

**書籍カード（BookCard.tsx）**

```typescript
// app/components/book/BookCard.tsx
// サーバーサイドコンポーネント（静的表示）
export function BookCard({ book }: { book: Book }) {
  return (
    <Card>
      <BookCover src={book.thumbnail_url} alt={book.title} />
      <BookMeta
        title={book.title}
        authors={book.authors}
        publisher={book.publisher}
      />
      <BookProgress current={book.current_page} total={book.page_count} />
      <Badge status={book.status} />
    </Card>
  );
}
```

**進捗スライダー（ProgressSlider.tsx）**

```typescript
// app/islands/ProgressSlider.tsx
// クライアントサイドコンポーネント（インタラクティブ）
export default function ProgressSlider({
  bookId,
  initialPage,
  totalPages,
}: Props) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const handleUpdate = async () => {
    await updateProgress(bookId, currentPage);
  };

  return (
    <div>
      <input
        type="range"
        value={currentPage}
        max={totalPages}
        onChange={(e) => setCurrentPage(Number(e.target.value))}
      />
      <Button onClick={handleUpdate}>更新</Button>
    </div>
  );
}
```

### 主要画面のコンポーネント構成例

#### ダッシュボード（`/`）

```
routes/index.tsx
├── Layout
│   ├── Header
│   └── Container
│       ├── UserStats (components/user/)
│       ├── BookList (components/book/)
│       │   └── BookCard × N
│       └── BookFilter (islands/)
```

#### 書籍詳細（`/books/:id`）

```
routes/books/[id]/index.tsx
├── Layout
│   └── Container
│       ├── BookCover (components/book/)
│       ├── BookMeta (components/book/)
│       ├── ProgressSlider (islands/)
│       ├── BookStatusToggle (islands/)
│       ├── TagInput (islands/)
│       └── MemoEditor (islands/)
```

### 実装の優先順位

**フェーズ 1: 基礎コンポーネント**

1. `components/ui/` - Button, Input, Card, Badge
2. `components/layout/` - Header, Container
3. 型定義（`types/`）

**フェーズ 2: ドメインコンポーネント**

1. `components/book/` - BookCard, BookList, BookCover
2. `components/user/` - UserProfile, UserStats

**フェーズ 3: インタラクティブ機能**

1. `islands/` - BookSearchForm, ProgressSlider
2. `islands/` - TagInput, MemoEditor

### 推奨事項

1. **TypeScript 型の厳密な定義** - `types/`で一元管理
2. **Props Drilling 回避** - 必要に応じて Context API を使用
3. **コンポーネントのテスト容易性** - 純粋関数として設計
4. **パフォーマンス最適化** - Islands は最小限に、必要な部分だけインタラクティブに
5. **アクセシビリティ** - セマンティック HTML、ARIA 属性の適切な使用

この構造により、HonoX の Islands アーキテクチャの利点を活かしつつ、保守性と拡張性の高いコードベースを構築できます。
