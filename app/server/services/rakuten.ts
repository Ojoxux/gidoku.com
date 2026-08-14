import { ExternalApiError } from "../lib/errors";
import type { BookSearchResultDto } from "../../types/dto";

interface RakutenBookApiItem {
  isbn: string;
  title: string;
  author: string;
  publisherName: string;
  salesDate: string;
  size: string;
  itemCaption: string;
  largeImageUrl: string;
  affiliateUrl: string;
}

interface RakutenBookApiResponse {
  Items: Array<{ Item: RakutenBookApiItem }>;
  pageCount: number;
  hits: number;
}

interface RakutenApiErrorResponse {
  error?: string;
  error_description?: string;
  errors?: {
    errorCode?: number | string;
    errorMessage?: string;
  };
}

interface RakutenApiErrorDetails {
  code?: string;
  description?: string;
}

const RAKUTEN_API_BASE = "https://openapi.rakuten.co.jp/services/api/BooksBook/Search/20170404";
const MAX_ATTEMPTS = 3;
const MAX_RETRY_DELAY_MS = 5_000;
const RETRYABLE_STATUSES = new Set([429, 503]);

/**
 * 楽天ブックスAPIで書籍を検索
 */
export async function searchBooks(
  query: string,
  applicationId: string,
  accessKey: string,
  requestOrigin: string,
  limit: number = 20,
  page: number = 1,
): Promise<{ results: BookSearchResultDto[]; hits: number; pageCount: number }> {
  const url = new URL(RAKUTEN_API_BASE);
  url.searchParams.set("applicationId", applicationId);
  url.searchParams.set("title", query);
  url.searchParams.set("hits", String(Math.min(limit, 10)));
  url.searchParams.set("page", String(page));
  url.searchParams.set("format", "json");

  const data = await requestRakuten(url, accessKey, requestOrigin, "search_books");

  return {
    results: data.Items.map((item) => mapRakutenItem(item.Item)),
    hits: data.hits,
    pageCount: data.pageCount,
  };
}

/**
 * ISBNで書籍を検索
 */
export async function searchByISBN(
  isbn: string,
  applicationId: string,
  accessKey: string,
  requestOrigin: string,
): Promise<BookSearchResultDto | null> {
  const url = new URL(RAKUTEN_API_BASE);
  url.searchParams.set("applicationId", applicationId);
  url.searchParams.set("isbn", isbn);
  url.searchParams.set("format", "json");

  const data = await requestRakuten(url, accessKey, requestOrigin, "search_by_isbn");

  if (data.Items.length === 0) {
    return null;
  }

  return mapRakutenItem(data.Items[0].Item);
}

/**
 * 著者名で書籍を検索
 */
export async function searchByAuthor(
  author: string,
  applicationId: string,
  accessKey: string,
  requestOrigin: string,
  limit: number = 20,
): Promise<BookSearchResultDto[]> {
  const url = new URL(RAKUTEN_API_BASE);
  url.searchParams.set("applicationId", applicationId);
  url.searchParams.set("author", author);
  url.searchParams.set("hits", String(Math.min(limit, 30)));
  url.searchParams.set("format", "json");

  const data = await requestRakuten(url, accessKey, requestOrigin, "search_by_author");

  return data.Items.map((item) => mapRakutenItem(item.Item));
}

async function requestRakuten(
  url: URL,
  accessKey: string,
  requestOrigin: string,
  operation: string,
  attempt: number = 1,
): Promise<RakutenBookApiResponse> {
  let response: Response;

  try {
    const origin = new URL(requestOrigin).origin;

    response = await fetch(url, {
      headers: {
        accessKey,
        Origin: origin,
        Referer: `${origin}/`,
      },
    });
  } catch (error) {
    throw new ExternalApiError("Failed to fetch from Rakuten API", "Rakuten", error);
  }

  if (response.ok) {
    try {
      return (await response.json()) as RakutenBookApiResponse;
    } catch (error) {
      throw new ExternalApiError("Rakuten API returned an invalid response", "Rakuten", error);
    }
  }

  const upstreamError = await readRakutenError(response);
  const willRetry = RETRYABLE_STATUSES.has(response.status) && attempt < MAX_ATTEMPTS;

  console.error(
    JSON.stringify({
      event: "rakuten_api_error",
      operation,
      status: response.status,
      upstreamCode: upstreamError.code,
      upstreamDescription: upstreamError.description,
      attempt,
      willRetry,
    }),
  );

  if (!willRetry) {
    throw new ExternalApiError(`Rakuten API returned ${response.status}`, "Rakuten");
  }

  await sleep(getRetryDelayMs(response, attempt));
  return requestRakuten(url, accessKey, requestOrigin, operation, attempt + 1);
}

async function readRakutenError(response: Response): Promise<RakutenApiErrorDetails> {
  try {
    const body = (await response.json()) as RakutenApiErrorResponse;
    const nestedCode = body.errors?.errorCode;

    return {
      code: body.error ?? (nestedCode === undefined ? undefined : String(nestedCode)),
      description: body.error_description ?? body.errors?.errorMessage,
    };
  } catch {
    return {};
  }
}

function getRetryDelayMs(response: Response, attempt: number): number {
  const retryAfter = response.headers.get("Retry-After");

  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.min(seconds * 1_000, MAX_RETRY_DELAY_MS);
    }

    const retryAt = Date.parse(retryAfter);
    if (!Number.isNaN(retryAt)) {
      return Math.min(Math.max(0, retryAt - Date.now()), MAX_RETRY_DELAY_MS);
    }
  }

  return 250 * 2 ** (attempt - 1);
}

function sleep(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

/**
 * 楽天APIのレスポンスを内部形式にマッピング
 */
function mapRakutenItem(item: RakutenBookApiItem): BookSearchResultDto {
  return {
    rakutenBooksId: item.isbn,
    title: item.title,
    authors: parseAuthors(item.author),
    publisher: item.publisherName,
    publishedDate: item.salesDate,
    isbn: item.isbn,
    pageCount: parsePageCount(item.size),
    description: item.itemCaption || "",
    thumbnailUrl: item.largeImageUrl,
    rakutenAffiliateUrl: item.affiliateUrl,
  };
}

/**
 * 著者文字列をパース
 * 楽天APIでは著者が "著者1/著者2" や "著者1、著者2" の形式で返される
 */
function parseAuthors(authorString: string): string[] {
  if (!authorString) return [];

  // 複数の区切り文字に対応
  const separators = /[/、,，]/;
  return authorString
    .split(separators)
    .map((author) => author.trim())
    .filter((author) => author.length > 0);
}

/**
 * ページ数をパース
 * 楽天APIでは "256p" のような形式で返される
 */
function parsePageCount(size: string): number {
  if (!size) return 0;

  const match = size.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
