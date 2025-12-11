import type { Type } from "arktype";
import { ValidationError } from "./errors";

/**
 * データを検証
 */
export function validate<T>(schema: Type<T>, data: unknown): T {
  const result = schema(data);

  if (result instanceof Error) {
    const errorMessage = result.message;
    throw new ValidationError("Validation failed", { message: errorMessage });
  }

  return result as T;
}

/**
 * データを安全に検証
 */
export function validateSafe<T>(
  schema: Type<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema(data);

  if (result instanceof Error) {
    return {
      success: false,
      error: result.message,
    };
  }

  return { success: true, data: result as T };
}

/**
 * UUIDが有効かどうか
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * ISBNが有効かどうか
 */
export function isValidISBN(isbn: string): boolean {
  // ISBN-10 または ISBN-13
  const isbn10Regex = /^\d{9}[\dX]$/;
  const isbn13Regex = /^\d{13}$/;
  return isbn10Regex.test(isbn) || isbn13Regex.test(isbn);
}

/**
 * メールアドレスが有効かどうか
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * URLが有効かどうか
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
