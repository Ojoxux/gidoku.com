import type { FC } from "hono/jsx";
import { Avatar } from "../ui/Avatar";

interface UserProfileProps {
  username: string;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export const UserProfile: FC<UserProfileProps> = ({
  username,
  name,
  bio,
  avatarUrl,
}) => {
  return (
    <div class="flex items-start gap-6">
      <Avatar src={avatarUrl} alt={name} size="xl" class="w-20 h-20 ring-4 ring-zinc-50 shadow-sm" />
      <div class="flex-1">
        <h1 class="text-3xl font-bold tracking-tight text-zinc-900 mb-1">{name}</h1>
        <p class="text-zinc-500 font-medium mb-3">@{username}</p>
        {bio && (
          <p class="text-zinc-600 leading-relaxed max-w-2xl">{bio}</p>
        )}
      </div>
    </div>
  );
};
