import { createRoute } from "honox/factory";
import { requirePageAuth, getSidebarExpanded } from "../../lib/page-auth";
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/ui/Button";
import BooksStatusTabs from "../../islands/BooksStatusTabs";
import { bookRepo } from "../../server/db/repositories";
import type { Book, BookStatus } from "../../types/database";

export default createRoute(async (c) => {
  const authResult = await requirePageAuth(c);
  if (authResult instanceof Response) {
    return authResult;
  }
  const user = authResult;
  const sidebarExpanded = getSidebarExpanded(c);

  const search = c.req.query("search");
  const initialTab = c.req.query("status") as BookStatus | undefined;
  const sortBy = c.req.query("sort") as
    | "title"
    | "created"
    | "updated"
    | "progress"
    | undefined;

  const { books, total } = await bookRepo.findByUserId(c.env.DB, user.id, {
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

  return c.render(
    <Layout user={user} title="My Books" sidebarExpanded={sidebarExpanded}>
      <div class="space-y-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div>
            <h1 class="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">
              自分の本棚
            </h1>
            <p class="text-zinc-500 font-medium">全 {total} 冊</p>
          </div>
          <a
            href="/books/new"
            class="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white bg-zinc-900 rounded-full hover:bg-zinc-800 transition-all shadow-sm"
          >
            <svg
              aria-hidden="true"
              class="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>本を追加</title>
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

        <form method="get" class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1 relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                aria-hidden="true"
                class="h-4 w-4 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <title>検索</title>
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
              class="w-full pl-10 pr-4 py-2.5 bg-zinc-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-zinc-400 hover:bg-zinc-200/50"
            />
          </div>

          <Button type="submit" class="sm:w-auto w-full font-bold py-2.5 rounded-xl">
            検索
          </Button>
        </form>

        <BooksStatusTabs
          books={formatBooks(books)}
          total={total}
          initialTab={initialTab}
        />
      </div>
    </Layout>
  );
});
