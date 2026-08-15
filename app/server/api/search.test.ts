import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { env } from "cloudflare:test";
import api from "./index";
import { createTestSession, createTestUser, cleanupDatabase } from "../../test/helpers";
import type {
  ErrorResponseDto,
  SearchBookByIsbnResponseDto,
  SearchBooksResponseDto,
  SuccessResponseDto,
} from "../../types/dto";

describe("Search API Integration", () => {
  beforeEach(async () => {
    await cleanupDatabase(env.DB);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return 401 without session", async () => {
    const res = await api.request("/search/books?query=react", {}, env);
    expect(res.status).toBe(401);
  });

  it("should return 400 for invalid query", async () => {
    const user = await createTestUser(env.DB);
    const sessionId = await createTestSession(env.KV, user.id);

    const res = await api.request(
      "/search/books?query=",
      {
        headers: { Cookie: `session_id=${sessionId}` },
      },
      env,
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponseDto;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return search results sorted by technical score and published date", async () => {
    const user = await createTestUser(env.DB);
    const sessionId = await createTestSession(env.KV, user.id);

    const mockResponse = {
      Items: [
        {
          Item: {
            isbn: "9780000000001",
            title: "Older React Book",
            author: "Author A",
            publisherName: "技術評論社",
            salesDate: "2023年12月1日",
            size: "200p",
            itemCaption: "React book description",
            largeImageUrl: "https://example.com/older.png",
            affiliateUrl: "https://example.com/older",
          },
        },
        {
          Item: {
            isbn: "9780000000002",
            title: "Newer Novel",
            author: "Author B",
            publisherName: "Publisher B",
            salesDate: "2024年1月2日",
            size: "320p",
            itemCaption: "Newer novel description",
            largeImageUrl: "https://example.com/newer.png",
            affiliateUrl: "https://example.com/newer",
          },
        },
      ],
      pageCount: 1,
      hits: 2,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );

    const res = await api.request(
      "/search/books?query=react&limit=5&page=1",
      {
        headers: { Cookie: `session_id=${sessionId}` },
      },
      env,
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessResponseDto<SearchBooksResponseDto>;
    expect(body.success).toBe(true);
    expect(body.data.results).toHaveLength(1);
    expect(body.data.results[0].title).toBe("Older React Book");
    expect(body.data.results[0].publishedDate).toBe("2023年12月1日");
    expect(body.data.results[0].techScore).toBeGreaterThan(0);
    expect(body.data.results[0].scoreReasons).toBeUndefined();
    expect(body.data.hits).toBe(2);
    expect(body.data.pageCount).toBe(1);
  });

  it("should exclude non-technical books from search results", async () => {
    const user = await createTestUser(env.DB);
    const sessionId = await createTestSession(env.KV, user.id);

    const mockResponse = {
      Items: [
        {
          Item: {
            isbn: "9780000000010",
            title: "最近の小説",
            author: "Author Novel",
            publisherName: "一般出版社",
            salesDate: "2026年1月1日",
            size: "280p",
            itemCaption: "話題のフィクション",
            largeImageUrl: "https://example.com/novel.png",
            affiliateUrl: "https://example.com/novel",
          },
        },
        {
          Item: {
            isbn: "9780000000011",
            title: "料理レシピ大全",
            author: "Author Cook",
            publisherName: "料理社",
            salesDate: "2025年6月1日",
            size: "180p",
            itemCaption: "家庭の味",
            largeImageUrl: "https://example.com/cook.png",
            affiliateUrl: "https://example.com/cook",
          },
        },
      ],
      pageCount: 1,
      hits: 2,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );

    const res = await api.request(
      "/search/books?query=react",
      {
        headers: { Cookie: `session_id=${sessionId}` },
      },
      env,
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessResponseDto<SearchBooksResponseDto>;
    expect(body.success).toBe(true);
    expect(body.data.results).toEqual([]);
  });

  it.each(["1", "true"])("should include score reasons when debug=%s", async (debug) => {
    const user = await createTestUser(env.DB);
    const sessionId = await createTestSession(env.KV, user.id);

    const mockResponse = {
      Items: [
        {
          Item: {
            isbn: "9780000000003",
            title: "Docker入門",
            author: "Author C",
            publisherName: "翔泳社",
            salesDate: "2024年1月1日",
            size: "240p",
            itemCaption: "Linuxとコンテナの基礎",
            largeImageUrl: "",
            affiliateUrl: "",
          },
        },
      ],
      pageCount: 1,
      hits: 1,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );

    const res = await api.request(
      `/search/books?query=docker&debug=${debug}`,
      {
        headers: { Cookie: `session_id=${sessionId}` },
      },
      env,
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: {
        results: Array<{
          techScore: number;
          scoreReasons?: Array<{ type: string; label: string; score: number }>;
        }>;
      };
    };

    expect(body.success).toBe(true);
    expect(body.data.results[0].techScore).toBeGreaterThan(0);
    expect(body.data.results[0].scoreReasons).toEqual(
      expect.arrayContaining([
        { type: "tech_publisher", label: "翔泳社", score: 30 },
        { type: "title_keyword", label: "Docker", score: 15 },
      ]),
    );
  });

  it("should return 400 for invalid isbn", async () => {
    const user = await createTestUser(env.DB);
    const sessionId = await createTestSession(env.KV, user.id);

    const res = await api.request(
      "/search/isbn/123",
      {
        headers: { Cookie: `session_id=${sessionId}` },
      },
      env,
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponseDto;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details).toContain("isbn must be matched");
  });

  it("should return null when ISBN search has no results", async () => {
    const user = await createTestUser(env.DB);
    const sessionId = await createTestSession(env.KV, user.id);

    const mockResponse = { Items: [], pageCount: 0, hits: 0 };
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );

    const res = await api.request(
      "/search/isbn/9784873119038",
      {
        headers: { Cookie: `session_id=${sessionId}` },
      },
      env,
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessResponseDto<SearchBookByIsbnResponseDto>;
    expect(body.success).toBe(true);
    expect(body.data).toBeNull();
  });
});
