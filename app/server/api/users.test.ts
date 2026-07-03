import { describe, it, expect, beforeEach } from "vitest";
import { env } from "cloudflare:test";
import api from "./index";
import {
  createTestBook,
  createTestSession,
  createTestUser,
  cleanupDatabase,
} from "../../test/helpers";
import type {
  DeletedResponseDto,
  ErrorResponseDto,
  PublicBookDto,
  PublicProfileDto,
  SuccessResponseDto,
  UserDto,
  UsernameAvailabilityDto,
} from "../../types/dto";

describe("Users API Integration", () => {
  beforeEach(async () => {
    await cleanupDatabase(env.DB);
  });

  it("should return 401 for /users/me without session", async () => {
    const res = await api.request("/users/me", {}, env);
    expect(res.status).toBe(401);
  });

  it("should return current user info", async () => {
    const user = await createTestUser(env.DB);
    const sessionId = await createTestSession(env.KV, user.id);

    const res = await api.request(
      "/users/me",
      {
        headers: { Cookie: `session_id=${sessionId}` },
      },
      env,
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessResponseDto<UserDto>;
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(user.id);
    expect(body.data.username).toBe(user.username);
  });

  it("should reject reserved username update", async () => {
    const user = await createTestUser(env.DB);
    const sessionId = await createTestSession(env.KV, user.id);

    const res = await api.request(
      "/users/me",
      {
        method: "PUT",
        headers: {
          Cookie: `session_id=${sessionId}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: "admin" }),
      },
      env,
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponseDto;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("RESERVED_USERNAME");
    expect(body.error.message).toBe("このユーザー名は使用できません");
  });

  it("should update user profile fields", async () => {
    const user = await createTestUser(env.DB);
    const sessionId = await createTestSession(env.KV, user.id);

    const res = await api.request(
      "/users/me",
      {
        method: "PUT",
        headers: {
          Cookie: `session_id=${sessionId}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Updated Name",
          bio: "Updated bio",
          avatarUrl: "https://example.com/avatar.png",
        }),
      },
      env,
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessResponseDto<UserDto>;
    expect(body.data.name).toBe("Updated Name");
    expect(body.data.bio).toBe("Updated bio");
    expect(body.data.avatarUrl).toBe("https://example.com/avatar.png");
  });

  it("should return unavailable for reserved username check", async () => {
    const res = await api.request("/users/check/admin", {}, env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessResponseDto<UsernameAvailabilityDto>;
    expect(body.data.available).toBe(false);
    expect(body.data.reason).toBe("reserved");
  });

  it("should return unavailable for taken username", async () => {
    const user = await createTestUser(env.DB);

    const res = await api.request(`/users/check/${user.username}`, {}, env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessResponseDto<UsernameAvailabilityDto>;
    expect(body.data.available).toBe(false);
  });

  it("should return public profile without private fields", async () => {
    const user = await createTestUser(env.DB);

    const res = await api.request(`/users/${user.username}`, {}, env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessResponseDto<PublicProfileDto>;
    expect(body.data.username).toBe(user.username);
    expect("email" in body.data).toBe(false);
    expect("provider" in body.data).toBe(false);
  });

  it("should return unread, reading, and completed books for public profile", async () => {
    const user = await createTestUser(env.DB);
    const otherUser = await createTestUser(env.DB, {
      username: "other_user",
      email: "other@example.com",
    });

    await createTestBook(env.DB, user.id, { status: "completed", memo: "private completed memo" });
    await createTestBook(env.DB, user.id, { status: "reading", memo: "private reading memo" });
    await createTestBook(env.DB, user.id, { status: "unread", memo: "private unread memo" });
    // 別ユーザーの本がレスポンスに混ざらないことを確認する
    await createTestBook(env.DB, otherUser.id, { status: "completed" });

    const res = await api.request(`/users/${user.username}/books`, {}, env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessResponseDto<PublicBookDto[]>;
    expect(body.data).toHaveLength(3);
    expect(body.data.map((book) => book.status).toSorted()).toEqual([
      "completed",
      "reading",
      "unread",
    ]);
    expect(body.data.every((book) => book.memo === null)).toBe(true);
    expect(body.data.every((book) => !("userId" in book))).toBe(true);
    expect(body.data.every((book) => !("rakutenBooksId" in book))).toBe(true);
    expect(body.data.every((book) => !("rakutenAffiliateUrl" in book))).toBe(true);
  });

  it("should delete user account", async () => {
    const user = await createTestUser(env.DB);
    const sessionId = await createTestSession(env.KV, user.id);

    const res = await api.request(
      "/users/me",
      {
        method: "DELETE",
        headers: { Cookie: `session_id=${sessionId}` },
      },
      env,
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessResponseDto<DeletedResponseDto>;
    expect(body.data.deleted).toBe(true);
    const result = await env.DB.prepare("SELECT id FROM users WHERE id = ?").bind(user.id).first();
    expect(result).toBeNull();
  });
});
