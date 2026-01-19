import type { Context } from "hono";

/**
 * アプリケーションエラーのクラス
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(
    message: string,
    statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    // Cloudflare Workers環境ではcaptureStackTraceが使えない場合がある
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * リソースが見つからない場合のエラー
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", details?: unknown) {
    super(message, 404, "NOT_FOUND", details);
    this.name = "NotFoundError";
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

/**
 * 認証エラー
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", details?: unknown) {
    super(message, 401, "UNAUTHORIZED", details);
    this.name = "UnauthorizedError";
  }
}

/**
 * 権限エラー
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", details?: unknown) {
    super(message, 403, "FORBIDDEN", details);
    this.name = "ForbiddenError";
  }
}

/**
 * データベースエラー
 */
export class DatabaseError extends AppError {
  constructor(message: string = "Database error", cause?: unknown) {
    super(message, 500, "DATABASE_ERROR", cause);
    this.name = "DatabaseError";
  }
}

/**
 * 外部APIエラー
 */
export class ExternalApiError extends AppError {
  constructor(
    message: string = "External API error",
    public apiName?: string,
    cause?: unknown
  ) {
    super(message, 502, "EXTERNAL_API_ERROR", cause);
    this.name = "ExternalApiError";
  }
}

/**
 * レート制限エラー
 */
export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests", retryAfter?: number) {
    super(message, 429, "RATE_LIMIT_EXCEEDED", { retryAfter });
    this.name = "RateLimitError";
  }
}

/**
 * 本番環境かどうかを判定
 */
function isProduction(c: Context): boolean {
  // CW環境では環境変数で判定
  const env = c.env as { ENVIRONMENT?: string } | undefined;
  return env?.ENVIRONMENT === "production";
}

/**
 * 安全に公開できるエラー詳細かどうかを判定
 */
function isSafeToExposeDetails(err: AppError): boolean {
  // バリデーションエラーとレート制限エラーの詳細は公開可能
  return err instanceof ValidationError || err instanceof RateLimitError;
}

/**
 * エラーハンドリングミドルウェア
 */
export function errorHandler(err: Error, c: Context) {
  // 本番環境ではスタックトレースをログしない
  const isProd = isProduction(c);

  console.error("Error occurred:", {
    name: err.name,
    message: err.message,
    ...(isProd ? {} : { stack: err.stack }),
  });

  if (err instanceof AppError) {
    // 本番環境では、安全なエラー以外はdetailsを隠す
    const shouldExposeDetails = !isProd || isSafeToExposeDetails(err);

    return c.json(
      {
        success: false,
        error: {
          message: err.message,
          code: err.code,
          ...(shouldExposeDetails && err.details
            ? { details: err.details }
            : {}),
        },
      },
      err.statusCode as 400 | 401 | 403 | 404 | 429 | 500 | 502
    );
  }

  // 予期しないエラー
  return c.json(
    {
      success: false,
      error: {
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      },
    },
    500
  );
}
