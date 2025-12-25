import { createRoute } from "honox/factory";
import { getPageUser, getSidebarExpanded } from "../lib/page-auth";
import { Layout } from "../components/layout/Layout";
import ReadingBooksCarousel from "../islands/ReadingBooksCarousel";
import { Card, CardBody } from "../components/ui/Card";
import { bookRepo } from "../server/db/repositories";
import { BookCover } from "../components/book/BookCover";
import type { Book } from "../types/database";

export default createRoute(async (c) => {
  const user = await getPageUser(c);
  const sidebarExpanded = getSidebarExpanded(c);

  // 未ログインの場合はランディングページ
  if (!user) {
    return c.render(
      <div class="relative h-screen w-full overflow-hidden bg-[#fdfdfd] text-zinc-900 selection:bg-zinc-900 selection:text-white font-sans">
        {/* ヘッダー */}
        <header class="absolute top-0 left-0 right-0 z-50 flex items-center justify-center w-full py-8">
          <nav class="flex items-center gap-2 px-2 py-2 bg-white/80 backdrop-blur-md border border-zinc-200/60 rounded-full shadow-sm shadow-zinc-200/20">
            <div class="pl-4 pr-2">
              <span class="italic text-xl font-bold tracking-tight" style={{ fontFamily: '"Apple Garamond", "Garamond", serif' }}>gidoku</span>
            </div>
            <div class="w-px h-4 bg-zinc-200 mx-1"></div>
            <a
              href="/login"
              class="px-5 py-2 text-sm font-medium text-white bg-zinc-900 rounded-full hover:bg-zinc-800 transition-all hover:shadow-lg hover:shadow-zinc-900/20"
            >
              ログイン
            </a>
          </nav>
        </header>

        {/* ヒーローセクション */}
        <main class="flex flex-col items-center justify-center h-full w-full px-6 relative">
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-zinc-100 to-transparent rounded-full blur-3xl opacity-60 -z-10 pointer-events-none"></div>

          <div class="space-y-10 text-center max-w-3xl mx-auto z-10">
             <div class="space-y-2">
                <h1 class="text-6xl sm:text-8xl md:text-9xl font-medium tracking-tighter leading-[0.9] text-zinc-900">
                  <span class="block" style={{ fontFamily: '"Apple Garamond", "Garamond", serif' }}>
                    Read<span class="text-zinc-300">.</span>
                  </span>
                  <span class="block" style={{ fontFamily: '"Apple Garamond", "Garamond", serif' }}>
                    Record<span class="text-zinc-300">.</span>
                  </span>
                  <span class="block" style={{ fontFamily: '"Apple Garamond", "Garamond", serif' }}>
                    Grow<span class="text-zinc-300">.</span>
                  </span>
                </h1>
             </div>

            <p class="text-lg sm:text-xl text-zinc-500 max-w-lg mx-auto leading-relaxed font-light">
              技術書の積読を消化し、学習の軌跡を可視化する。<br class="hidden sm:inline" />
              エンジニアのための、ミニマルな読書管理ツール。
            </p>

            <div class="pt-4">
               <a
                href="/login"
                class="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-zinc-900 bg-white border border-zinc-200 rounded-full hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm hover:shadow-md"
              >
                <span>無料で始める</span>
                <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </main>
        
        {/* フッター */}
        <div class="absolute bottom-6 left-0 right-0 text-center text-xs text-zinc-400 font-medium tracking-wide">
          &copy; 2025 gidoku.com
        </div>
      </div>
    );
  }

  // ログイン済みの場合はダッシュボード
  const stats = await bookRepo.getStats(c.env.DB, user.id);

  const { books: readingBooks } = await bookRepo.findByUserId(
    c.env.DB,
    user.id,
    {
      status: "reading",
      limit: 6,
      offset: 0,
    }
  );

  const { books: recentBooks } = await bookRepo.findByUserId(
    c.env.DB,
    user.id,
    {
      sortBy: "updated",
      limit: 6,
      offset: 0,
    }
  );

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

  const formattedReadingBooks = formatBooks(readingBooks);

  return c.render(
    <Layout user={user} title="ホーム" sidebarExpanded={sidebarExpanded}>
      <div class="space-y-16">
        {/* ヘッダーセクション */}
        <div class="flex flex-col md:flex-row gap-12 items-end border-b border-zinc-900 pb-12">
          <div class="flex-1">
            <div class="text-5xl md:text-7xl leading-[1.1] text-zinc-900 tracking-tight">
              <span style={{ fontFamily: '"Arial", sans-serif' }}>Hello,</span>{" "}
              <span
                class="border-b-[3px] md:border-b-4 border-zinc-900 pb-1"
                style={{ fontFamily: '"Apple Garamond", "Garamond", serif' }}
              >
                {user.name}
              </span>
              .
              <br />
              <span
                style={{ fontFamily: '"Apple Garamond", "Garamond", serif' }}
              >
                You have
              </span>{" "}
              <span
                class="border-b-[3px] md:border-b-4 border-zinc-900 pb-1"
                style={{ fontFamily: '"Arial", sans-serif' }}
              >
                {stats?.reading ?? 0} active books
              </span>
              .
            </div>
          </div>
        </div>

        {/* 読んでいる本のリスト */}
        {formattedReadingBooks.length > 0 && (
          <section>
            <div class="flex items-baseline justify-between mb-8 border-b border-zinc-200 pb-4">
              <h2
                class="text-3xl font-bold tracking-tight text-zinc-900"
                style={{ fontFamily: '"Arial", sans-serif' }}
              >
                読んでいる本
              </h2>
              <a
                href="/books?status=reading"
                class="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                style={{ fontFamily: '"Arial", sans-serif' }}
              >
                すべて見る
              </a>
            </div>

            <ReadingBooksCarousel books={formattedReadingBooks} />
          </section>
        )}

        <section>
          <div class="flex items-baseline justify-between mb-8 border-b border-zinc-200 pb-4">
            <h2
              class="text-3xl font-bold tracking-tight text-zinc-900"
              style={{ fontFamily: '"Arial", sans-serif' }}
            >
              最近の読書
            </h2>
            <a
              href="/books"
              class="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
              style={{ fontFamily: '"Arial", sans-serif' }}
            >
              すべて見る
            </a>
          </div>
          {recentBooks.length > 0 ? (
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {formatBooks(recentBooks).map((book) => (
                <a href={`/books/${book.id}`} class="group flex flex-col gap-3">
                  <div class="aspect-2/3 w-full bg-zinc-100 rounded-sm overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                    <BookCover
                      src={book.thumbnailUrl}
                      alt={book.title}
                      size="md"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3
                      class="text-sm font-bold text-zinc-900 line-clamp-2 leading-tight group-hover:underline decoration-1 underline-offset-2"
                      style={{ fontFamily: '"Arial", sans-serif' }}
                    >
                      {book.title}
                    </h3>
                    <p
                      class="text-xs text-zinc-500 mt-1 line-clamp-1"
                      style={{ fontFamily: '"Arial", sans-serif' }}
                    >
                      {book.authors.join(", ")}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <Card>
              <CardBody class="text-center py-16">
                <div class="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                  <svg
                    class="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <p
                  class="text-zinc-500 mb-6 font-medium"
                  style={{ fontFamily: '"Arial", sans-serif' }}
                >
                  読書記録をはじめましょう
                </p>
                <a
                  href="/books/new"
                  class="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm rounded-sm"
                  style={{ fontFamily: '"Arial", sans-serif' }}
                >
                  本を追加する
                </a>
              </CardBody>
            </Card>
          )}
        </section>
      </div>
    </Layout>
  );
});
