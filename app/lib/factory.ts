import { createFactory } from "hono/factory";
import type { HonoContext } from "../types/env";

// 型付きファクトリを作るやつ
export const factory = createFactory<HonoContext>();
export const createRoute = factory.createHandlers;
