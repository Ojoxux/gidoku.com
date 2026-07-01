import type { FC } from "hono/jsx";
import { createRoute } from "honox/factory";
import { getPageUser } from "../../lib/page-auth";
import { PublicProfileLayout } from "../../components/layout/PublicProfileLayout";
import { UserProfile } from "../../components/user/UserProfile";
import { UserStats } from "../../components/user/UserStats";
import ProfileBookTabs from "../../islands/ProfileBookTabs";
import { userRepo } from "../../server/db/repositories";
import { publicProfileService } from "../../server/services";
import type { PublicProfileBookListItem } from "../../server/services/publicProfile";
import type { User, BookStats } from "../../types/database";

interface PageProps {
  currentUser: User | null;
}

interface NotFoundPageProps extends PageProps {
  username: string;
}

interface ProfilePageProps extends PageProps {
  profileUser: User;
  stats: BookStats;
  readingBooks: PublicProfileBookListItem[];
  unreadBooks: PublicProfileBookListItem[];
  completedBooks: PublicProfileBookListItem[];
}

const NotFoundPage: FC<NotFoundPageProps> = ({ username, currentUser }) => (
  <PublicProfileLayout user={currentUser} title="ユーザーが見つかりません">
    <div class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center max-w-md mx-auto">
        <div class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          unreadBooks={stats.unread}
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

  const profileUser = await userRepo.findByUsername(c.env.DB, username).catch(() => null);

  if (!profileUser) {
    return c.render(<NotFoundPage username={username} currentUser={currentUser} />);
  }

  const { stats, readingBooks, unreadBooks, completedBooks } =
    await publicProfileService.getPublicProfileBooks(c.env.DB, profileUser.id);

  return c.render(
    <ProfilePage
      profileUser={profileUser}
      stats={stats}
      readingBooks={readingBooks}
      unreadBooks={unreadBooks}
      completedBooks={completedBooks}
      currentUser={currentUser}
    />,
  );
});
