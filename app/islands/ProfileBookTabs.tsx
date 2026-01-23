import { useState } from "hono/jsx/dom";
import type { BookStatus } from "../types/database";
import { BookCover } from "../components/book/BookCover";
import { Card, CardBody } from "../components/ui/Card";

interface BookListItem {
  id: string;
  title: string;
  authors: string[];
  thumbnailUrl: string | null;
  status: BookStatus;
}

interface ProfileBookTabsProps {
  readingBooks: BookListItem[];
  unreadBooks: BookListItem[];
  completedBooks: BookListItem[];
  userName: string;
}

type TabKey = "reading" | "unread" | "completed";

const tabOrder: TabKey[] = ["reading", "unread", "completed"];

const getDefaultTab = (tabs: Record<TabKey, BookListItem[]>): TabKey => {
  for (const key of tabOrder) {
    if (tabs[key].length > 0) {
      return key;
    }
  }
  return "reading";
};

export default function ProfileBookTabs({
  readingBooks,
  unreadBooks,
  completedBooks,
  userName,
}: ProfileBookTabsProps) {
  const tabs = {
    reading: readingBooks,
    unread: unreadBooks,
    completed: completedBooks,
  } satisfies Record<TabKey, BookListItem[]>;

  const [activeTab, setActiveTab] = useState<TabKey>(getDefaultTab(tabs));

  const tabItems = [
    { key: "reading" as const, label: "読書中", count: readingBooks.length },
    { key: "unread" as const, label: "積読中", count: unreadBooks.length },
    { key: "completed" as const, label: "読了", count: completedBooks.length },
  ];

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between gap-4">
        <h2 class="text-xl font-bold text-zinc-900">本の一覧</h2>
        <div
          class="inline-flex items-center gap-1 rounded-full bg-zinc-100 p-1"
          role="tablist"
          aria-label="本のステータス"
        >
          {tabItems.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                id={`tab-${tab.key}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.key}`}
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
        const books = tabs[tab.key];
        const isActive = tab.key === activeTab;

        return (
          <div
            key={tab.key}
            id={`panel-${tab.key}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.key}`}
            hidden={!isActive}
          >
            {books.length > 0 ? (
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
                {books.map((book) => (
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
              <Card>
                <CardBody class="text-center py-16">
                  <div class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      class="w-8 h-8 text-zinc-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <title>本のアイコン</title>
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 class="text-lg font-bold tracking-tight text-zinc-900 mb-2">
                    まだ公開されている本がありません
                  </h3>
                  <p class="text-zinc-500 text-sm">
                    {userName}さんの読書記録はまだありません
                  </p>
                </CardBody>
              </Card>
            )}
          </div>
        );
      })}
    </div>
  );
}
