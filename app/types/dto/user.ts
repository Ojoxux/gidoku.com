import type { BookStatus } from "../book";

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

export interface PublicBookDto {
  id: string;
  title: string;
  authors: string[];
  publisher: string | null;
  publishedDate: string | null;
  isbn: string | null;
  pageCount: number;
  description: string | null;
  thumbnailUrl: string | null;
  status: BookStatus;
  currentPage: number;
  memo: null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
