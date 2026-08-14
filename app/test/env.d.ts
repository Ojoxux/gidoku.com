import type { Env } from "../types/env";

type D1Database = Env["DB"];
type KVNamespace = Env["KV"];
type AuthRateLimiter = Env["AUTH_RATE_LIMITER"];
type SearchRateLimiter = Env["SEARCH_RATE_LIMITER"];
type ApiRateLimiter = Env["API_RATE_LIMITER"];

declare module "cloudflare:test" {
  interface ProvidedEnv {
    DB: D1Database;
    KV: KVNamespace;
    AUTH_RATE_LIMITER: AuthRateLimiter;
    SEARCH_RATE_LIMITER: SearchRateLimiter;
    API_RATE_LIMITER: ApiRateLimiter;
  }
}
