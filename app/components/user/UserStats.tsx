import type { FC } from "hono/jsx";

interface UserStatsProps {
  totalBooks: number;
  unreadBooks: number;
  readingBooks: number;
  completedBooks: number;
}

export const UserStats: FC<UserStatsProps> = ({
  totalBooks,
  unreadBooks,
  readingBooks,
  completedBooks,
}) => {
  const items = [
    { label: "冊", value: totalBooks },
    { label: "積読中", value: unreadBooks },
    { label: "読書中", value: readingBooks },
    { label: "読了", value: completedBooks },
  ];

  return (
    <div class="grid grid-cols-2 gap-x-8 gap-y-4 text-zinc-600 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-zinc-900">{item.value}</span>
          <span class="text-sm">{item.label}</span>
        </div>
      ))}
    </div>
  );
};
