import { Hono } from "hono";
import type { HonoContext } from "../../types/env";
import { userRepo, bookRepo } from "../db/repositories";
import { authMiddleware, optionalAuthMiddleware } from "../lib/auth";
import { validator, getValidated } from "../lib/validator";
import { updateUserSchema, usernameSchema } from "./schemas";
import type { UpdateUserInput } from "./schemas/user";
import { isReservedUsername } from "./schemas/user";
import { toUserResponse, toBookResponse } from "../lib/mapper";
import { successResponse } from "../lib/response";

const app = new Hono<HonoContext>();

/**
 * 現在のユーザー情報取得
 * GET /api/users/me
 */
app.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");
  return successResponse(c, toUserResponse(user));
});

/**
 * プロフィール更新
 * PUT /api/users/me
 */
app.put(
  "/me",
  authMiddleware,
  validator("json", updateUserSchema),
  async (c) => {
    const userId = c.get("userId");
    const data = getValidated<UpdateUserInput>(c, "json");

    if (data.username && isReservedUsername(data.username)) {
      return c.json({ error: "このユーザー名は使用できません" }, 400);
    }

    const updatedUser = await userRepo.update(c.env.DB, userId, {
      username: data.username,
      name: data.name,
      bio: data.bio,
      avatar_url: data.avatarUrl,
    });

    return successResponse(c, toUserResponse(updatedUser));
  }
);

/**
 * ユーザー名の重複チェック
 * GET /api/users/check/:username
 */
app.get(
  "/check/:username",
  validator("param", usernameSchema),
  async (c) => {
    const { username } = getValidated<{ username: string }>(c, "param");

    if (isReservedUsername(username)) {
      return successResponse(c, { available: false, reason: "reserved" });
    }

    const isTaken = await userRepo.isUsernameTaken(c.env.DB, username);

    return successResponse(c, { available: !isTaken });
  }
);

/**
 * 公開プロフィール取得
 * GET /api/users/:username
 */
app.get(
  "/:username",
  optionalAuthMiddleware,
  validator("param", usernameSchema),
  async (c) => {
    const { username } = getValidated<{ username: string }>(c, "param");
    const user = await userRepo.findByUsername(c.env.DB, username);

    // 公開情報のみ返す
    return successResponse(c, {
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
    });
  }
);

/**
 * ユーザーの公開書籍一覧
 * GET /api/users/:username/books
 */
app.get("/:username/books", optionalAuthMiddleware, async (c) => {
  const username = c.req.param("username");
  const user = await userRepo.findByUsername(c.env.DB, username);

  // 完了した書籍のみ公開
  const { books } = await bookRepo.findByUserId(c.env.DB, user.id, {
    status: "completed",
    limit: 50,
    offset: 0,
  });

  return successResponse(
    c,
    books.map((book) => ({
      ...toBookResponse(book),
      // 公開用に一部フィールドを隠す
      memo: null,
    }))
  );
});

/**
 * アカウント削除
 * DELETE /api/users/me
 */
app.delete("/me", authMiddleware, async (c) => {
  const userId = c.get("userId");
  await userRepo.deleteById(c.env.DB, userId);

  return successResponse(c, { deleted: true });
});

export default app;

