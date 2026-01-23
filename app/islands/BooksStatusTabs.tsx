import { useState } from "hono/jsx/dom";
import type { BookStatus } from "../types/database";
import { BookCover } from "../components/book/BookCover";

interface BookItem {
  id: string;
  title: string;
  authors: string[];
  thumbnailUrl: string | null;
  status: BookStatus;
}

interface BooksStatusTabsProps {
  books: BookItem[];
  total: number;
  initialTab?: BookStatus;
}

type TabKey = "reading" | "unread" | "completed";

const tabOrder: TabKey[] = ["reading", "unread", "completed"];

const getDefaultTab = (
  tabs: Record<TabKey, BookItem[]>,
  initialTab?: BookStatus
): TabKey => {
  if (initialTab && tabOrder.includes(initialTab)) {
    return initialTab;
  }
  for (const key of tabOrder) {
    if (tabs[key].length > 0) {
      return key;
    }
  }
  return "reading";
};

const filterByStatus = (books: BookItem[], status: TabKey) =>
  books.filter((book) => book.status === status);

export default function BooksStatusTabs({
  books,
  total,
  initialTab,
}: BooksStatusTabsProps) {
  const tabs = {
    reading: filterByStatus(books, "reading"),
    unread: filterByStatus(books, "unread"),
    completed: filterByStatus(books, "completed"),
  } satisfies Record<TabKey, BookItem[]>;

  const [activeTab, setActiveTab] = useState<TabKey>(
    getDefaultTab(tabs, initialTab)
  );

  const tabItems = [
    { key: "reading" as const, label: "読書中", count: tabs.reading.length },
    { key: "unread" as const, label: "積読中", count: tabs.unread.length },
    { key: "completed" as const, label: "読了", count: tabs.completed.length },
  ];

  return (
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p class="text-zinc-500 font-medium">全 {total} 冊</p>
        <div
          class="inline-flex items-center gap-1 rounded-full bg-zinc-100 p-1"
          role="tablist"
          aria-label="読書ステータス"
        >
          {tabItems.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                id={`dashboard-tab-${tab.key}`}
                aria-selected={isActive}
                aria-controls={`dashboard-panel-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                class={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  class={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isActive ? "bg-zinc-900 text-white" : "bg-zinc-200 text-zinc-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {tabItems.map((tab) => {
        const isActive = tab.key === activeTab;
        const tabBooks = tabs[tab.key];

        return (
          <div
            key={tab.key}
            id={`dashboard-panel-${tab.key}`}
            role="tabpanel"
            aria-labelledby={`dashboard-tab-${tab.key}`}
            hidden={!isActive}
          >
            {tabBooks.length > 0 ? (
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
                {tabBooks.map((book) => (
                  <a href={`/books/${book.id}`} class="group flex flex-col gap-3">
                    <div class="relative aspect-2/3 w-full bg-zinc-100 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300 ring-1 ring-black/5 overflow-hidden">
                      <BookCover
                        src={book.thumbnailUrl}
                        alt={book.title}
                        size="lg"
                        class="w-full h-full object-cover"
                      />
                    </div>

                    <div class="space-y-1">
                      <h3 class="font-semibold text-zinc-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {book.title}
                      </h3>
                      <p class="text-xs text-zinc-500 line-clamp-1">
                        {book.authors.join(", ")}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div class="text-center py-24 bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200">
                <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-zinc-400 ring-1 ring-black/5">
                  <svg
                    aria-hidden="true"
                    class="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <title>本のアイコン</title>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-zinc-900 mb-1">
                  本が見つかりません
                </h3>
                <p class="text-zinc-500 mb-8 max-w-sm mx-auto text-sm">
                  条件に一致する本が見つかりませんでした。検索条件を変更するか、新しい本を追加してください。
                </p>
                <a
                  href="/books/new"
                  class="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  新しい本を追加
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
