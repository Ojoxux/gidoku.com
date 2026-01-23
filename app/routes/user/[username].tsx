import type { FC } from "hono/jsx";
import { createRoute } from "honox/factory";
import { getPageUser, getSidebarExpanded } from "../../lib/page-auth";
import { Layout } from "../../components/layout/Layout";
import { UserProfile } from "../../components/user/UserProfile";
import { UserStats } from "../../components/user/UserStats";
import { BookList } from "../../components/book/BookList";
import { Card, CardBody } from "../../components/ui/Card";
import { userRepo, bookRepo } from "../../server/db/repositories";
import type { User, Book, BookStats, BookStatus } from "../../types/database";

interface BookListItem {
  id: string;
  title: string;
  authors: string[];
  publisher: string | null;
  thumbnailUrl: string | null;
  status: BookStatus;
  currentPage: number;
  pageCount: number;
}

interface PageProps {
  currentUser: User | null;
  sidebarExpanded: boolean;
}

interface NotFoundPageProps extends PageProps {
  username: string;
}

interface ProfilePageProps extends PageProps {
  profileUser: User;
  stats: BookStats;
  readingBooks: BookListItem[];
  completedBooks: BookListItem[];
}

const toBookListItem = (book: Book): BookListItem => ({
  id: book.id,
  title: book.title,
  authors: JSON.parse(book.authors) as string[],
  publisher: book.publisher,
  thumbnailUrl: book.thumbnail_url,
  status: book.status,
  currentPage: book.current_page,
  pageCount: book.page_count,
});

const NotFoundPage: FC<NotFoundPageProps> = ({ username, currentUser, sidebarExpanded }) => (
  <Layout
    user={currentUser}
    title="ユーザーが見つかりません"
    sidebarExpanded={sidebarExpanded}
    appShell
    showSidebar
    showLogout={Boolean(currentUser)}
  >
    <div class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center max-w-md mx-auto">
        <div class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            class="w-8 h-8 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <title>ユーザーアイコン</title>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-zinc-900 mb-3">
          ユーザーが見つかりません
        </h1>
        <p class="text-zinc-500 mb-8 leading-relaxed">
          <span class="font-medium text-zinc-700">@{username}</span> というユーザーは存在しません
        </p>
        <a
          href="/"
          class="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-full hover:bg-zinc-800 transition-all shadow-sm"
        >
          トップページへ
        </a>
      </div>
    </div>
  </Layout>
);

const ProfilePage: FC<ProfilePageProps> = ({
  profileUser,
  stats,
  readingBooks,
  completedBooks,
  currentUser,
  sidebarExpanded,
}) => (
  <Layout
    user={currentUser}
    title={`${profileUser.name}の本棚`}
    sidebarExpanded={sidebarExpanded}
    appShell
    showSidebar
    showLogout={Boolean(currentUser)}
  >
    <div class="space-y-12">
      {/* Profile Header */}
      <div class="pb-6 border-b border-zinc-100">
        <UserProfile
          username={profileUser.username}
          name={profileUser.name}
          bio={profileUser.bio}
          avatarUrl={profileUser.avatar_url}
        />
      </div>

      {/* Stats Section */}
      <section>
        <h2 class="text-xl font-bold text-zinc-900 mb-6">本棚</h2>
        <UserStats
          totalBooks={stats.reading + stats.completed}
          readingBooks={stats.reading}
          completedBooks={stats.completed}
        />
      </section>

      {/* Reading Books Section */}
      {readingBooks.length > 0 && (
        <section>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-zinc-900">読書中</h2>
            <span class="text-sm font-medium text-zinc-500">
              {readingBooks.length}冊
            </span>
          </div>
          <BookList books={readingBooks} />
        </section>
      )}

      {/* Completed Books Section */}
      {completedBooks.length > 0 && (
        <section>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-zinc-900">読了</h2>
            <span class="text-sm font-medium text-zinc-500">
              {completedBooks.length}冊
            </span>
          </div>
          <BookList books={completedBooks} />
        </section>
      )}

      {/* Empty State */}
      {readingBooks.length === 0 && completedBooks.length === 0 && (
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
              {profileUser.name}さんの読書記録はまだありません
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  </Layout>
);

export default createRoute(async (c) => {
  const username = c.req.param("username") ?? "";

  const [currentUser, sidebarExpanded] = await Promise.all([
    getPageUser(c),
    Promise.resolve(getSidebarExpanded(c)),
  ]);
  const resolvedSidebarExpanded = currentUser ? sidebarExpanded : true;

  const profileUser = await userRepo
    .findByUsername(c.env.DB, username)
    .catch(() => null);

  if (!profileUser) {
    return c.render(
      <NotFoundPage
        username={username}
        currentUser={currentUser}
        sidebarExpanded={resolvedSidebarExpanded}
      />
    );
  }

  const [stats, { books: rawReadingBooks }, { books: rawCompletedBooks }] = await Promise.all([
    bookRepo.getStats(c.env.DB, profileUser.id),
    bookRepo.findByUserId(c.env.DB, profileUser.id, { status: "reading", limit: 12, offset: 0 }),
    bookRepo.findByUserId(c.env.DB, profileUser.id, { status: "completed", sortBy: "updated", limit: 24, offset: 0 }),
  ]);

  return c.render(
    <ProfilePage
      profileUser={profileUser}
      stats={stats}
      readingBooks={rawReadingBooks.map(toBookListItem)}
      completedBooks={rawCompletedBooks.map(toBookListItem)}
      currentUser={currentUser}
      sidebarExpanded={resolvedSidebarExpanded}
    />
  );
});
