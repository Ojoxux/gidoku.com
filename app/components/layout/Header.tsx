import type { FC } from "hono/jsx";
import type { User } from "../../types/database";
import { Avatar } from "../ui/Avatar";

interface HeaderProps {
  user?: User | null;
}

export const Header: FC<HeaderProps> = ({ user }) => {
  return (
    <header class="h-20 flex items-center justify-end px-8 w-full">
      <div class="flex items-center gap-4">
        {user ? (
          <div class="flex items-center gap-4">
            <div class="text-right sm:block">
              <span class="text-sm font-bold text-zinc-900">{user.name}</span>
            </div>
            <Avatar src={user.avatar_url} alt={user.name} size="md" />
          </div>
        ) : (
          <a
            href="/login"
            class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            ログイン
          </a>
        )}
      </div>
    </header>
  );
};
