import { createRoute } from "honox/factory";
import { getPageUser, getSidebarExpanded } from "../lib/page-auth";
import { Layout } from "../components/layout/Layout";
import ReadingBooksCarousel from "../islands/ReadingBooksCarousel";
import IconCloud from "../islands/IconCloud";
import { Card, CardBody } from "../components/ui/Card";
import { bookRepo } from "../server/db/repositories";
import { BookCover } from "../components/book/BookCover";
import type { Book } from "../types/database";

export default createRoute(async (c) => {
  const user = await getPageUser(c);
  const sidebarExpanded = getSidebarExpanded(c);

  // 未ログインの場合はランディングページ
  if (!user) {
    const techIcons = [
      "https://cdn.simpleicons.org/typescript/3178C6",
      "https://cdn.simpleicons.org/javascript/F7DF1E",
      "https://cdn.simpleicons.org/react/61DAFB",
      "https://cdn.simpleicons.org/python/3776AB",
      "https://cdn.simpleicons.org/go/00ADD8",
      "https://cdn.simpleicons.org/rust/000000",
      "https://cdn.simpleicons.org/docker/2496ED",
      "https://cdn.simpleicons.org/kubernetes/326CE5",
      "https://cdn.simpleicons.org/git/F05032",
      "https://cdn.simpleicons.org/github/181717",
      "https://cdn.simpleicons.org/googlecloud/4285F4",
      "https://cdn.simpleicons.org/postgresql/4169E1",
      "https://cdn.simpleicons.org/redis/DC382D",
      "https://cdn.simpleicons.org/graphql/E10098",
      "https://cdn.simpleicons.org/nextdotjs/000000",
      "https://cdn.simpleicons.org/vuedotjs/4FC08D",
      "https://cdn.simpleicons.org/svelte/FF3E00",
      "https://cdn.simpleicons.org/tailwindcss/06B6D4",
      "https://cdn.simpleicons.org/nodedotjs/339933",
      "https://cdn.simpleicons.org/deno/000000",
      "https://cdn.simpleicons.org/swift/F05138",
      "https://cdn.simpleicons.org/kotlin/7F52FF",
      "https://cdn.simpleicons.org/c++/00599C",
      "https://cdn.simpleicons.org/ruby/CC342D",
      "https://cdn.simpleicons.org/php/777BB4",
      "https://cdn.simpleicons.org/linux/FCC624",
      "https://cdn.simpleicons.org/nginx/009639",
      "https://cdn.simpleicons.org/terraform/844FBA",
    ];

    return c.render(
      <div class="relative min-h-screen w-full overflow-hidden bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white font-sans">
        {/* 背景装飾 */}
        <div class="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

        {/* ヘッダー */}
        <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full py-6 px-6">
          <nav class="flex items-center justify-between w-full max-w-6xl mx-auto bg-white/80 backdrop-blur-xl border border-zinc-200/60 rounded-full px-6 py-3.5 shadow-lg shadow-zinc-900/5">
            {/* Logo */}
            <div class="flex items-center gap-2.5">
              <img src="/favicon128.ico" alt="gidoku" class="w-8 h-8 rounded-lg" />
              <span class="text-xl font-bold tracking-tight text-zinc-900">
                gidoku
              </span>
            </div>

            {/* Navigation */}
            <div class="flex items-center gap-2">
              <a
                href="/login"
                class="px-6 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-full hover:bg-zinc-800 transition-all shadow-sm hover:shadow-md"
              >
                ログイン
              </a>
            </div>
          </nav>
        </header>

        {/* ヒーローセクション */}
        <main class="flex flex-col items-center justify-center min-h-screen w-full px-6 pt-20">
          <div class="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center h-full">
            <div class="space-y-8 text-center lg:text-left order-2 lg:order-1 z-10 pointer-events-none">
              <div class="space-y-4 pointer-events-auto">
                <style>{`
                  @keyframes fadeInBlack {
                    from { color: #a1a1aa; }
                    to { color: #18181b; }
                  }
                  @keyframes fadeInGreen {
                    from { color: #a1a1aa; }
                    to { color: #059669; }
                  }
                  .animate-read {
                    color: #a1a1aa;
                    animation: fadeInBlack 0.6s ease-out 0.5s forwards;
                  }
                  .animate-record {
                    color: #a1a1aa;
                    animation: fadeInBlack 0.6s ease-out 1.3s forwards;
                  }
                  .animate-grow {
                    color: #a1a1aa;
                    animation: fadeInGreen 0.6s ease-out 2.1s forwards;
                  }
                `}</style>
                <h1 class="text-6xl sm:text-7xl lg:text-8xl font-mono font-semibold tracking-tight leading-[1.2]">
                  <span class="animate-read">Read;</span>
                  <br />
                  <span class="animate-record">Record;</span>
                  <br />
                  <span class="animate-grow">Grow;</span>
                </h1>
              </div>

              <p class="text-lg text-zinc-500 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light pointer-events-auto">
                技術書の積読を消化し、学習の軌跡を可視化する。
                <br />
                エンジニアのための、シンプルで美しい読書管理ツール。
              </p>

              <div class="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pointer-events-auto">
                <a
                  href="/login"
                  class="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white bg-zinc-900 rounded-full hover:bg-zinc-800 hover:scale-105 transition-all shadow-xl shadow-zinc-900/10"
                >
                  <span>無料で始める</span>
                  <svg
                    class="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Icon Cloud with Book */}
            <div class="flex items-center justify-center order-1 lg:order-2 h-[500px] lg:h-[700px] w-full max-w-[700px] mx-auto relative -mt-20 lg:-mt-32">
              {/* Icon Cloud */}
              <div class="relative z-10">
                <IconCloud images={techIcons} width={700} height={700} />
              </div>

              {/* Open Book Base - Realistic */}
              <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] z-0 opacity-90">
                <svg
                  viewBox="0 0 440 140"
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-full"
                  style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))" }}
                >
                  <defs>
                    <linearGradient
                      id="coverGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stop-color="#18181b" />
                      <stop offset="50%" stop-color="#27272a" />
                      <stop offset="100%" stop-color="#18181b" />
                    </linearGradient>

                    <linearGradient
                      id="pageGradLeft"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stop-color="#e4e4e7" />
                      <stop offset="90%" stop-color="#a1a1aa" />
                      <stop offset="100%" stop-color="#71717a" />
                    </linearGradient>

                    <linearGradient
                      id="pageGradRight"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stop-color="#71717a" />
                      <stop offset="10%" stop-color="#a1a1aa" />
                      <stop offset="100%" stop-color="#e4e4e7" />
                    </linearGradient>
                  </defs>

                  {/* Hard Cover (Bottom Layer) */}
                  <path
                    d="M35 55 Q35 45, 75 40 Q165 30, 220 50 L220 125 Q165 105, 75 115 Q35 120, 35 110 Z"
                    fill="url(#coverGrad)"
                  />
                  <path
                    d="M220 50 Q275 30, 365 40 Q405 45, 405 55 L405 115 Q405 125, 365 120 Q275 105, 220 125 Z"
                    fill="url(#coverGrad)"
                  />

                  {/* Page Block (Thickness) */}
                  <path
                    d="M40 50 Q40 40, 80 37 Q170 27, 220 47 L220 118 Q170 100, 80 110 Q40 113, 40 103 Z"
                    fill="#52525b"
                  />
                  <path
                    d="M220 47 Q270 27, 360 37 Q400 40, 400 50 L400 103 Q400 113, 360 110 Q270 100, 220 118 Z"
                    fill="#52525b"
                  />

                  {/* Top Pages */}
                  <path
                    d="M40 48 Q40 38, 80 35 Q170 25, 220 45 L220 115 Q170 98, 80 108 Q40 111, 40 101 Z"
                    fill="url(#pageGradLeft)"
                  />
                  <path
                    d="M220 45 Q270 25, 360 35 Q400 38, 400 48 L400 101 Q400 111, 360 108 Q270 98, 220 115 Z"
                    fill="url(#pageGradRight)"
                  />

                  {/* Texture Lines */}
                  <g opacity="0.1">
                    <path
                      d="M55 50 Q130 40, 200 55"
                      stroke="#000"
                      stroke-width="1"
                      fill="none"
                    />
                    <path
                      d="M55 65 Q130 55, 200 70"
                      stroke="#000"
                      stroke-width="1"
                      fill="none"
                    />
                    <path
                      d="M55 80 Q130 70, 200 85"
                      stroke="#000"
                      stroke-width="1"
                      fill="none"
                    />

                    <path
                      d="M240 55 Q310 40, 385 50"
                      stroke="#000"
                      stroke-width="1"
                      fill="none"
                    />
                    <path
                      d="M240 70 Q310 55, 385 65"
                      stroke="#000"
                      stroke-width="1"
                      fill="none"
                    />
                    <path
                      d="M240 85 Q310 70, 385 80"
                      stroke="#000"
                      stroke-width="1"
                      fill="none"
                    />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </main>
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
      <div class="space-y-12">
        {/* ヘッダーセクション */}
        <div class="pb-2">
          <h1 class="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
            こんにちは、{user.name}さん
          </h1>
          <p class="text-zinc-500 font-medium">
            現在、<span class="text-zinc-900">{stats?.reading ?? 0}</span>
            冊の本を読んでいます。
          </p>
        </div>

        {/* 読んでいる本のリスト */}
        {formattedReadingBooks.length > 0 && (
          <section>
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-zinc-900">読んでいる本</h2>
              <a
                href="/books?status=reading"
                class="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                すべて見る
              </a>
            </div>

            <ReadingBooksCarousel books={formattedReadingBooks} />
          </section>
        )}

        <section>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-zinc-900">最近の読書</h2>
            <a
              href="/books"
              class="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              すべて見る
            </a>
          </div>
          {recentBooks.length > 0 ? (
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-10">
              {formatBooks(recentBooks).map((book) => (
                <a href={`/books/${book.id}`} class="group flex flex-col gap-3">
                  <div class="aspect-2/3 w-full bg-zinc-100 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 ring-1 ring-black/5">
                    <BookCover
                      src={book.thumbnailUrl}
                      alt={book.title}
                      size="md"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 class="text-sm font-semibold text-zinc-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {book.title}
                    </h3>
                    <p class="text-xs text-zinc-500 mt-1.5 line-clamp-1">
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
                <p class="text-zinc-500 mb-6 font-medium">
                  読書記録をはじめましょう
                </p>
                <a
                  href="/books/new"
                  class="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm rounded-full"
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
