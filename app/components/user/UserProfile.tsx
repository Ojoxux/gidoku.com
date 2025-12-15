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
    <div class="flex items-start gap-4">
      <Avatar src={avatarUrl} alt={name} size="xl" />
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{name}</h1>
        <p class="text-gray-500">@{username}</p>
        {bio && <p class="mt-2 text-gray-600">{bio}</p>}
      </div>
    </div>
  );
};
