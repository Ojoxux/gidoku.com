import { createRoute } from "honox/factory";
import { requirePageAuth, getSidebarExpanded } from "../../lib/page-auth";
import { Layout } from "../../components/layout/Layout";
import { BookCover } from "../../components/book/BookCover";
import { Button } from "../../components/ui/Button";
import { bookRepo } from "../../server/db/repositories";
import type { Book, BookStatus } from "../../types/database";

export default createRoute(async (c) => {
  const authResult = await requirePageAuth(c);
  if (authResult instanceof Response) {
    return authResult;
  }
  const user = authResult;
  const sidebarExpanded = getSidebarExpanded(c);

  const status = c.req.query("status") as BookStatus | undefined;
  const search = c.req.query("search");
  const sortBy = c.req.query("sort") as
    | "title"
    | "created"
    | "updated"
    | "progress"
    | undefined;

  const { books, total } = await bookRepo.findByUserId(c.env.DB, user.id, {
    status,
    search,
    sortBy: sortBy || "updated",
    limit: 50,
    offset: 0,
  });

  const formatBooks = (books: Book[]) =>
    books.map((book) => ({
      id: book.id,
      title: book.title,
      authors: JSON.parse(book.authors),
      publisher: book.publisher,
      thumbnailUrl: book.thumbnail_url,
      status: book.status,
      currentPage: book.current_page,
      pageCount: book.page_count,
    }));

  const statusOptions: { value: string; label: string }[] = [
    { value: "", label: "すべて" },
    { value: "unread", label: "積読" },
    { value: "reading", label: "読書中" },
    { value: "completed", label: "読了" },
  ];

  return c.render(
    <Layout user={user} title="My Books" sidebarExpanded={sidebarExpanded}>
      <div class="space-y-12">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-8">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold text-zinc-900 mb-2">
              自分の本棚
            </h1>
            <p class="text-zinc-500">全 {total} 冊</p>
          </div>
          <a
            href="/books/new"
            class="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-zinc-900 rounded-full hover:bg-zinc-800 transition-all hover:scale-105 shadow-lg shadow-zinc-900/10"
          >
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            新しい本を追加
          </a>
        </div>

        <form method="get" class="flex flex-col sm:flex-row gap-4">
          <div class="relative min-w-[160px]">
            <select
              name="status"
              class="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option value={opt.value} selected={status === opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <div class="flex-1 relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                class="h-5 w-5 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="search"
              name="search"
              placeholder="タイトル、著者名で検索..."
              value={search || ""}
              class="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow placeholder:text-zinc-400"
            />
          </div>

          <Button type="submit" class="sm:w-auto w-full font-bold">
            検索
          </Button>
        </form>

        {books.length > 0 ? (
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12">
            {formatBooks(books).map((book) => (
              <a href={`/books/${book.id}`} class="group flex flex-col gap-4">
                <div class="relative aspect-2/3 w-full bg-zinc-100 rounded-sm shadow-sm group-hover:shadow-xl transition-all duration-300 ease-out group-hover:-translate-y-1 overflow-hidden">
                  <BookCover
                    src={book.thumbnailUrl}
                    alt={book.title}
                    size="lg"
                    class="w-full h-full object-cover"
                  />
                  {/* Status Overlay */}
                  <div class="absolute top-2 right-2">
                    {book.status === "reading" && (
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-white shadow-sm">
                        読書中
                      </span>
                    )}
                    {book.status === "completed" && (
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 text-zinc-900 shadow-sm backdrop-blur-sm">
                        読了
                      </span>
                    )}
                  </div>
                </div>

                <div class="space-y-1">
                  <h3 class="font-bold text-zinc-900 text-sm leading-snug line-clamp-2 group-hover:underline decoration-1 underline-offset-2">
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
          <div class="text-center py-24 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-zinc-400">
              <svg
                class="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
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
            <p class="text-zinc-500 mb-8 max-w-sm mx-auto">
              条件に一致する本が見つかりませんでした。検索条件を変更するか、新しい本を追加してください。
            </p>
            <a
              href="/books/new"
              class="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors shadow-sm"
            >
              新しい本を追加
            </a>
          </div>
        )}
      </div>
    </Layout>
  );
});
