import { createRoute } from "honox/factory";
import { getPageUser, getSidebarExpanded } from "../lib/page-auth";
import { Layout } from "../components/layout/Layout";
import { UserProfile } from "../components/user/UserProfile";
import { UserStats } from "../components/user/UserStats";
import { BookList } from "../components/book/BookList";
import { Card, CardBody } from "../components/ui/Card";
import { userRepo, bookRepo } from "../server/db/repositories";

export default createRoute(async (c) => {
  const currentUser = await getPageUser(c);
  const sidebarExpanded = getSidebarExpanded(c);
  const username = c.req.param("username")!;

  // ユーザーを検索
  let profileUser;
  try {
    profileUser = await userRepo.findByUsername(c.env.DB, username);
  } catch {
    return c.render(
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
  }

  // 公開用の統計情報
  const stats = await bookRepo.getStats(c.env.DB, profileUser.id);

  // 読書中の本
  const { books: readingBooks } = await bookRepo.findByUserId(
    c.env.DB,
    profileUser.id,
    {
      status: "reading",
      limit: 12,
      offset: 0,
    }
  );

  // 読了した本
  const { books: completedBooks } = await bookRepo.findByUserId(
    c.env.DB,
    profileUser.id,
    {
      status: "completed",
      sortBy: "updated",
      limit: 24,
      offset: 0,
    }
  );

  const formatBooks = (books: any[]) =>
    books.map((b) => ({
      id: b.id,
      title: b.title,
      authors: JSON.parse(b.authors),
      publisher: b.publisher,
      thumbnailUrl: b.thumbnail_url,
      status: b.status,
      currentPage: b.current_page,
      pageCount: b.page_count,
    }));

  return c.render(
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
            <BookList books={formatBooks(readingBooks)} />
          </section>
        )}

        {completedBooks.length > 0 && (
          <section>
            <h2 class="text-lg font-semibold text-gray-900 mb-4">読了</h2>
            <BookList books={formatBooks(completedBooks)} />
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
});
