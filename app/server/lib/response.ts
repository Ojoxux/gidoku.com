import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * 成功レスポンスの型
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
}

/**
 * エラーレスポンスの型
 */
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

/**
 * APIレスポンスの型（成功またはエラー）
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * ページネーション付きレスポンスの型
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * 成功レスポンスを返す
 */
export function successResponse<T, S extends ContentfulStatusCode = 200>(
  c: Context,
  data: T,
  status?: S
) {
  return c.json<SuccessResponse<T>, S>(
    {
      success: true,
      data,
    },
    (status ?? 200) as S
  );
}

/**
 * エラーレスポンスを返す
 */
export function errorResponse<S extends ContentfulStatusCode = 400>(
  c: Context,
  message: string,
  code: string,
  status?: S,
  details?: unknown
) {
  return c.json<ErrorResponse, S>(
    {
      success: false,
      error: {
        message,
        code,
        details,
      },
    },
    (status ?? 400) as S
  );
}

/**
 * ページネーシン付きレスポンスを返す
 */
export function paginatedResponse<T, S extends ContentfulStatusCode = 200>(
  c: Context,
  items: T[],
  total: number,
  limit: number,
  offset: number,
  status?: S
) {
  return c.json<SuccessResponse<PaginatedResponse<T>>, S>(
    {
      success: true,
      data: {
        items,
        total,
        limit,
        offset,
        hasMore: offset + items.length < total,
      },
    },
    (status ?? 200) as S
  );
}
