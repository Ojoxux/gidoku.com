import type { SecureHeadersVariables } from "hono/secure-headers";
import type { User } from "./database";

export interface Env extends Cloudflare.Env {
  // wrangler.jsonc に定義されていない環境変数
  ENVIRONMENT?: "development" | "production";
}

/**
 * コンテキスト変数型
 * SecureHeadersVariablesを含めてCSP nonceを対応させる
 */
export interface Variables extends SecureHeadersVariables {
  userId: string;
  user: User;
}

/**
 * Honoのコンテキスト型
 */
export type HonoContext = {
  Bindings: Env;
  Variables: Variables;
};
