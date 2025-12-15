import type { FC } from "hono/jsx";
import { Card, CardBody } from "../ui/Card";

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
    <div class="grid grid-cols-3 gap-4">
      <Card>
        <CardBody class="text-center">
          <div class="text-3xl font-bold tracking-tight text-zinc-900">
            {totalBooks}
          </div>
          <div class="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">
            総冊数
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody class="text-center">
          <div class="text-3xl font-bold tracking-tight text-zinc-900">
            {readingBooks}
          </div>
          <div class="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">
            読書中
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody class="text-center">
          <div class="text-3xl font-bold tracking-tight text-zinc-900">
            {completedBooks}
          </div>
          <div class="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">
            読了
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
