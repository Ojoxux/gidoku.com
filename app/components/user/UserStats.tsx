import type { FC } from "hono/jsx";

interface UserStatsProps {
  totalBooks: number;
  readingBooks: number;
  completedBooks: number;
}

export const UserStats: FC<UserStatsProps> = ({
  totalBooks,
  readingBooks,
  completedBooks,
}) => {
  return (
    <div class="flex items-center gap-8 text-zinc-600">
      <div class="flex items-baseline gap-2">
        <span class="text-3xl font-bold text-zinc-900">{totalBooks}</span>
        <span class="text-sm">冊</span>
      </div>
      <div class="w-px h-8 bg-zinc-200"></div>
      <div class="flex items-baseline gap-2">
        <span class="text-3xl font-bold text-zinc-900">{readingBooks}</span>
        <span class="text-sm">読書中</span>
      </div>
      <div class="w-px h-8 bg-zinc-200"></div>
      <div class="flex items-baseline gap-2">
        <span class="text-3xl font-bold text-zinc-900">{completedBooks}</span>
        <span class="text-sm">読了</span>
      </div>
    </div>
  );
};
