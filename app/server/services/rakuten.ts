import { ExternalApiError } from "../lib/errors";

export interface BookSearchResult {
  rakutenBooksId: string;
  title: string;
  authors: string[];
  publisher: string;
  publishedDate: string;
  isbn: string;
  pageCount: number;
  description: string;
  thumbnailUrl: string;
  rakutenAffiliateUrl: string;
}

interface RakutenBookItem {
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

interface RakutenBookResponse {
  Items: Array<{ Item: RakutenBookItem }>;
  pageCount: number;
  hits: number;
}

const RAKUTEN_API_BASE = "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404";

/**
 * 楽天ブックスAPIで書籍を検索
 */
export async function searchBooks(
  query: string,
  applicationId: string,
  limit: number = 20
): Promise<BookSearchResult[]> {
  const url = new URL(RAKUTEN_API_BASE);
  url.searchParams.set("applicationId", applicationId);
  url.searchParams.set("title", query);
  url.searchParams.set("hits", String(Math.min(limit, 30)));
  url.searchParams.set("format", "json");

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new ExternalApiError(
        `Rakuten API returned ${response.status}`,
        "Rakuten"
      );
    }

    const data: RakutenBookResponse = await response.json();

    return data.Items.map((item) => mapRakutenItem(item.Item));
  } catch (error) {
    if (error instanceof ExternalApiError) throw error;
    throw new ExternalApiError("Failed to fetch from Rakuten API", "Rakuten", error);
  }
}

/**
 * ISBNで書籍を検索
 */
export async function searchByISBN(
  isbn: string,
  applicationId: string
): Promise<BookSearchResult | null> {
  const url = new URL(RAKUTEN_API_BASE);
  url.searchParams.set("applicationId", applicationId);
  url.searchParams.set("isbn", isbn);
  url.searchParams.set("format", "json");

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new ExternalApiError(
        `Rakuten API returned ${response.status}`,
        "Rakuten"
      );
    }

    const data: RakutenBookResponse = await response.json();

    if (data.Items.length === 0) {
      return null;
    }

    return mapRakutenItem(data.Items[0].Item);
  } catch (error) {
    if (error instanceof ExternalApiError) throw error;
    throw new ExternalApiError("Failed to fetch from Rakuten API", "Rakuten", error);
  }
}

/**
 * 著者名で書籍を検索
 */
export async function searchByAuthor(
  author: string,
  applicationId: string,
  limit: number = 20
): Promise<BookSearchResult[]> {
  const url = new URL(RAKUTEN_API_BASE);
  url.searchParams.set("applicationId", applicationId);
  url.searchParams.set("author", author);
  url.searchParams.set("hits", String(Math.min(limit, 30)));
  url.searchParams.set("format", "json");

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new ExternalApiError(
        `Rakuten API returned ${response.status}`,
        "Rakuten"
      );
    }

    const data: RakutenBookResponse = await response.json();

    return data.Items.map((item) => mapRakutenItem(item.Item));
  } catch (error) {
    if (error instanceof ExternalApiError) throw error;
    throw new ExternalApiError("Failed to fetch from Rakuten API", "Rakuten", error);
  }
}

/**
 * 楽天APIのレスポンスを内部形式にマッピング
 */
function mapRakutenItem(item: RakutenBookItem): BookSearchResult {
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
  const separators = /[\/、,，]/;
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

