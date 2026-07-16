import type { UserDto } from "./user";

export interface AuthSessionDto {
  authenticated: true;
  user: UserDto;
}

export interface LogoutResponseDto {
  loggedOut: boolean;
}
