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
  <Layout user={currentUser} title="ユーザーが見つかりません" sidebarExpanded={sidebarExpanded}>
    <div class="text-center py-12">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">
        ユーザーが見つかりません
      </h1>
      <p class="text-gray-500 mb-8">
        @{username} というユーザーは存在しません
      </p>
      <a href="/" class="text-blue-600 hover:text-blue-700">
        トップページへ
      </a>
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
  <Layout user={currentUser} title={`${profileUser.name}の本棚`} sidebarExpanded={sidebarExpanded}>
    <div class="space-y-8">
      <UserProfile
        username={profileUser.username}
        name={profileUser.name}
        bio={profileUser.bio}
        avatarUrl={profileUser.avatar_url}
      />

      <UserStats
        totalBooks={stats.reading + stats.completed}
        readingBooks={stats.reading}
        completedBooks={stats.completed}
      />

      {readingBooks.length > 0 && (
        <section>
          <h2 class="text-lg font-semibold text-gray-900 mb-4">読書中</h2>
          <BookList books={readingBooks} />
        </section>
      )}

      {completedBooks.length > 0 && (
        <section>
          <h2 class="text-lg font-semibold text-gray-900 mb-4">読了</h2>
          <BookList books={completedBooks} />
        </section>
      )}

      {readingBooks.length === 0 && completedBooks.length === 0 && (
        <Card>
          <CardBody class="text-center py-8">
            <p class="text-gray-500">まだ公開されている本がありません</p>
          </CardBody>
        </Card>
      )}
    </div>
  </Layout>
);

export default createRoute(async (c) => {
  const username = c.req.param("username")!;
  const [currentUser, sidebarExpanded] = await Promise.all([
    getPageUser(c),
    Promise.resolve(getSidebarExpanded(c)),
  ]);

  const profileUser = await userRepo
    .findByUsername(c.env.DB, username)
    .catch(() => null);

  if (!profileUser) {
    return c.render(
      <NotFoundPage
        username={username}
        currentUser={currentUser}
        sidebarExpanded={sidebarExpanded}
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
      sidebarExpanded={sidebarExpanded}
    />
  );
});
