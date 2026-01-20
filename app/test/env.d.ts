import type { Env } from "../types/env";

type D1Database = Env["DB"];
type KVNamespace = Env["KV"];

declare module 'cloudflare:test' {
  interface ProvidedEnv {
    DB: D1Database
    KV: KVNamespace
  }
}
