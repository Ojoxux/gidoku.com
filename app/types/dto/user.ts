import type { BookDto } from "./book";

export interface UserDto {
  id: string;
  username: string;
  email: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  provider: "github" | "google";
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequestDto {
  username?: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UsernameAvailabilityDto {
  available: boolean;
  reason?: "reserved";
}

export interface PublicProfileDto {
  id: string;
  username: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
}

export interface PublicBookDto extends BookDto {
  memo: null;
}
