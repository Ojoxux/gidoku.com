import type { FC } from "hono/jsx";
import { createRoute } from "honox/factory";
import { getPageUser } from "../../lib/page-auth";
import { PublicProfileLayout } from "../../components/layout/PublicProfileLayout";
import { UserProfile } from "../../components/user/UserProfile";
import { UserStats } from "../../components/user/UserStats";
import ProfileBookTabs from "../../islands/ProfileBookTabs";
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
}

interface NotFoundPageProps extends PageProps {
  username: string;
}

interface ProfilePageProps extends PageProps {
  profileUser: User;
  stats: BookStats;
  readingBooks: BookListItem[];
  unreadBooks: BookListItem[];
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

const NotFoundPage: FC<NotFoundPageProps> = ({ username, currentUser }) => (
  <PublicProfileLayout user={currentUser} title="ユーザーが見つかりません">
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
  </PublicProfileLayout>
);

const ProfilePage: FC<ProfilePageProps> = ({
  profileUser,
  stats,
  readingBooks,
  unreadBooks,
  completedBooks,
  currentUser,
}) => (
  <PublicProfileLayout user={currentUser} title={`${profileUser.name}の本棚`}>
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
          totalBooks={stats.total}
          readingBooks={stats.reading}
          completedBooks={stats.completed}
        />
      </section>

      <section>
        <ProfileBookTabs
          readingBooks={readingBooks}
          unreadBooks={unreadBooks}
          completedBooks={completedBooks}
          userName={profileUser.name}
        />
      </section>
    </div>
  </PublicProfileLayout>
);

export default createRoute(async (c) => {
  const username = c.req.param("username") ?? "";

  const currentUser = await getPageUser(c);

  const profileUser = await userRepo
    .findByUsername(c.env.DB, username)
    .catch(() => null);

  if (!profileUser) {
    return c.render(
      <NotFoundPage username={username} currentUser={currentUser} />
    );
  }

  const [stats, { books: rawReadingBooks }, { books: rawUnreadBooks }, { books: rawCompletedBooks }] =
    await Promise.all([
    bookRepo.getStats(c.env.DB, profileUser.id),
    bookRepo.findByUserId(c.env.DB, profileUser.id, { status: "reading", limit: 12, offset: 0 }),
    bookRepo.findByUserId(c.env.DB, profileUser.id, { status: "unread", sortBy: "updated", limit: 24, offset: 0 }),
    bookRepo.findByUserId(c.env.DB, profileUser.id, { status: "completed", sortBy: "updated", limit: 24, offset: 0 }),
  ]);

  return c.render(
    <ProfilePage
      profileUser={profileUser}
      stats={stats}
      readingBooks={rawReadingBooks.map(toBookListItem)}
      unreadBooks={rawUnreadBooks.map(toBookListItem)}
      completedBooks={rawCompletedBooks.map(toBookListItem)}
      currentUser={currentUser}
    />
  );
});
