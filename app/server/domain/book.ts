import type { BookStatus } from "../../types/database";

/**
 * 進捗に基づいてステータスを計算
 */
export function calculateStatus(
  currentPage: number,
  pageCount: number
): BookStatus {
  if (currentPage === 0) return "unread";
  if (pageCount > 0 && currentPage >= pageCount) return "completed";
  return "reading";
}

/**
 * 進捗率を計算（0-100）
 */
export function calculateProgress(
  currentPage: number,
  pageCount: number
): number {
  if (pageCount === 0) return 0;
  return Math.min(100, Math.round((currentPage / pageCount) * 100));
}

/**
 * ページ数のバリデーション
 */
export function validatePageProgress(
  currentPage: number,
  pageCount: number
): { valid: boolean; error?: string } {
  if (currentPage < 0) {
    return { valid: false, error: "Current page cannot be negative" };
  }
  if (pageCount > 0 && currentPage > pageCount) {
    return { valid: false, error: "Current page exceeds total pages" };
  }
  return { valid: true };
}

/**
 * 書籍が読了済みかどうか
 */
export function isCompleted(status: BookStatus): boolean {
  return status === "completed";
}

/**
 * 書籍が読書中かどうか
 */
export function isReading(status: BookStatus): boolean {
  return status === "reading";
}

/**
 * 読了日を設定すべきか判定
 */
export function shouldSetFinishedAt(
  newStatus: BookStatus,
  oldStatus: BookStatus
): boolean {
  return newStatus === "completed" && oldStatus !== "completed";
}
