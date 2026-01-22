/**
 * 指定されたミリ秒数の間スリープ
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * ランダムな文字列を生成
 */
export function generateRandomString(length: number = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(
    randomValues,
    (value) => chars[value % chars.length]
  ).join("");
}

/**
 * オブジェクトからundefinedのプロパティを削除
 */
export function removeUndefined<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

/**
 * 配列を指定されたサイズのチャンクに分割
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunkCount = Math.ceil(array.length / size);
  return Array.from({ length: chunkCount }, (_, index) =>
    array.slice(index * size, index * size + size)
  );
}

/**
 * 日付をISO形式の文字列に変換
 */
export function toISOString(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * スネークケースをキャメルケースに変換
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * キャメルケースをスネークケースに変換
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * オブジェクトのキーをキャメルケースに変換
 */
export function keysToCamel<T extends Record<string, unknown>>(
  obj: T
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [snakeToCamel(key), value])
  );
}

/**
 * オブジェクトのキーをスネークケースに変換
 */
export function keysToSnake<T extends Record<string, unknown>>(
  obj: T
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [camelToSnake(key), value])
  );
}

/**
 * 文字列を指定された長さに切り詰め
 */
export function truncate(str: string, maxLength: number): string {
  return str.length <= maxLength ? str : `${str.slice(0, maxLength - 3)}...`;
}

/**
 * 関数をデバウンス
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/**
 * 関数をリトライ
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await sleep(delay * (i + 1)); // 指数バックオフ
      }
    }
  }

  throw lastError;
}

