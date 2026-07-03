/**
 * Branded/Nominal type utility
 * 同じプリミティブ型でも異なるドメイン概念を型レベルで区別するための仕組み
 */
declare const brandSymbol: unique symbol;
export type Brand<T, B extends string> = T & { readonly [brandSymbol]: B };

/**
 * Branded ID types
 * string を渡せる場所で誤って別 ID を渡してしまうミスをコンパイル時に検出できる
 */
export type UserId = Brand<string, "UserId">;
export type BookId = Brand<string, "BookId">;
export type TagId = Brand<string, "TagId">;
export type SessionId = Brand<string, "SessionId">;

/**
 * OAuth プロバイダー - 単一の定義元
 */
export type OAuthProvider = "github" | "google";

/**
 * 書籍ステータス - 単一の定義元
 * unread: 積読, reading: 読書中, completed: 読了
 */
export type BookStatus = "unread" | "reading" | "completed";

/**
 * 書籍ソート順
 */
export type BookSortOrder = "title" | "created" | "updated" | "progress";
