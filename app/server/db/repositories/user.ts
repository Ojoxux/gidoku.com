import { DatabaseError, NotFoundError } from "../../lib/errors";
import type { User, UserInput } from "../../../types/database";
import type { Env } from "../../../types/env";

type D1Database = Env["DB"];
type D1BindValue = string | number | null;

/**
 * IDでユーザーを取得
 */
export async function findById(db: D1Database, userId: string): Promise<User> {
  try {
    const result = await db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(userId)
      .first<User>();

    if (!result) {
      throw new NotFoundError("User not found");
    }

    return result;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError("Failed to fetch user", error);
  }
}

/**
 * ユーザー名でユーザーを取得
 */
export async function findByUsername(
  db: D1Database,
  username: string
): Promise<User> {
  try {
    const result = await db
      .prepare("SELECT * FROM users WHERE username = ?")
      .bind(username)
      .first<User>();

    if (!result) {
      throw new NotFoundError("User not found");
    }

    return result;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError("Failed to fetch user by username", error);
  }
}

/**
 * メールアドレスでユーザーを取得
 */
export async function findByEmail(
  db: D1Database,
  email: string
): Promise<User | null> {
  try {
    const result = await db
      .prepare("SELECT * FROM users WHERE email = ?")
      .bind(email)
      .first<User>();

    return result || null;
  } catch (error) {
    throw new DatabaseError("Failed to fetch user by email", error);
  }
}

/**
 * プロバイダーIDでユーザーを取得
 */
export async function findByProvider(
  db: D1Database,
  provider: "github" | "google",
  providerId: string
): Promise<User | null> {
  try {
    const result = await db
      .prepare("SELECT * FROM users WHERE provider = ? AND provider_id = ?")
      .bind(provider, providerId)
      .first<User>();

    return result || null;
  } catch (error) {
    throw new DatabaseError("Failed to fetch user by provider", error);
  }
}

/**
 * ユーザー名の重複チェック
 */
export async function isUsernameTaken(
  db: D1Database,
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  try {
    let query = "SELECT id FROM users WHERE username = ?";
    const params: D1BindValue[] = [username];

    if (excludeUserId) {
      query += " AND id != ?";
      params.push(excludeUserId);
    }

    const result = await db
      .prepare(query)
      .bind(...params)
      .first();

    return result !== null;
  } catch (error) {
    throw new DatabaseError("Failed to check username availability", error);
  }
}

/**
 * ユーザーを作成
 */
export async function create(db: D1Database, user: UserInput): Promise<User> {
  try {
    // ユーザー名の重複チェック
    const isTaken = await isUsernameTaken(db, user.username);
    if (isTaken) {
      throw new DatabaseError("Username already taken");
    }

    await db
      .prepare(
        `
        INSERT INTO users (
          id, username, email, name, bio, avatar_url,
          provider, provider_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      )
      .bind(
        user.id,
        user.username,
        user.email,
        user.name,
        user.bio || null,
        user.avatar_url || null,
        user.provider,
        user.provider_id,
        user.created_at,
        user.updated_at
      )
      .run();

    return findById(db, user.id);
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError("Failed to create user", error);
  }
}

/**
 * ユーザー情報を更新
 */
export async function update(
  db: D1Database,
  userId: string,
  data: Partial<UserInput>
): Promise<User> {
  try {
    // ユーザーの存在確認
    await findById(db, userId);

    const fields: string[] = [];
    const params: D1BindValue[] = [];

    if (data.username !== undefined) {
      // ユーザー名の重複チェック
      const isTaken = await isUsernameTaken(db, data.username, userId);
      if (isTaken) {
        throw new DatabaseError("Username already taken");
      }
      fields.push("username = ?");
      params.push(data.username);
    }

    if (data.name !== undefined) {
      fields.push("name = ?");
      params.push(data.name);
    }

    if (data.bio !== undefined) {
      fields.push("bio = ?");
      params.push(data.bio);
    }

    if (data.avatar_url !== undefined) {
      fields.push("avatar_url = ?");
      params.push(data.avatar_url);
    }

    if (fields.length === 0) {
      return findById(db, userId);
    }

    fields.push("updated_at = ?");
    params.push(new Date().toISOString());

    params.push(userId);

    await db
      .prepare(
        `
        UPDATE users 
        SET ${fields.join(", ")}
        WHERE id = ?
      `
      )
      .bind(...params)
      .run();

    return findById(db, userId);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof DatabaseError)
      throw error;
    throw new DatabaseError("Failed to update user", error);
  }
}

/**
 * ユーザーを削除
 */
export async function deleteById(
  db: D1Database,
  userId: string
): Promise<void> {
  try {
    // ユーザーの存在確認
    await findById(db, userId);

    // CASCADE削除により関連データも削除される
    await db.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError("Failed to delete user", error);
  }
}

