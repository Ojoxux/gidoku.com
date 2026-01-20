import type { Env } from "../../types/env";

type D1Database = Env["DB"];

export function getDB(env: { DB: D1Database }): D1Database {
  return env.DB;
}

export async function testConnection(db: D1Database): Promise<boolean> {
  try {
    await db.prepare("SELECT 1").first();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
