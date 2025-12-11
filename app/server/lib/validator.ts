import type { Context, MiddlewareHandler } from "hono";
import type { Type } from "arktype";

type ValidatedDataKey =
  | "validated_json"
  | "validated_query"
  | "validated_param"
  | "validated_form";

/*
 * Hono用のバリデーターミドルウェア
 */
export function validator<T>(
  target: "json" | "query" | "param" | "form",
  schema: Type<T>
): MiddlewareHandler {
  return async (c: Context, next) => {
    let data: unknown;

    switch (target) {
      case "json":
        data = await c.req.json();
        break;
      case "query":
        data = c.req.query();
        break;
      case "param":
        data = c.req.param();
        break;
      case "form":
        data = await c.req.parseBody();
        break;
      default:
        throw new Error(`Invalid target: ${target}`);
    }

    const result = schema(data);

    if (result instanceof Error) {
      return c.json(
        {
          success: false,
          error: {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details: result.message,
          },
        },
        400
      );
    }

    // 検証済みデータをコンテキストに保存
    const key = `validated_${target}` as ValidatedDataKey;
    c.set(key, result);

    await next();
  };
}

/**
 * 検証済みデータを取得するヘルパー
 */
export function getValidated<T>(
  c: Context,
  target: "json" | "query" | "param" | "form"
): T {
  const key = `validated_${target}` as ValidatedDataKey;
  return c.get(key) as T;
}
