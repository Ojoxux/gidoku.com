import { Hono } from "hono";
import type { HonoContext } from "../../types/env";
import { errorHandler } from "../lib/errors";
import books from "./books";
import tags from "./tags";
import users from "./users";
import auth from "./auth";
import search from "./search";

const app = new Hono<HonoContext>();

// エラーハンドリング
app.onError(errorHandler);

// ルーティング
app.route("/books", books);
app.route("/tags", tags);
app.route("/users", users);
app.route("/auth", auth);
app.route("/search", search);

// ヘルスチェック
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// RPC型エクスポート
export type AppType = typeof app;
export default app;

