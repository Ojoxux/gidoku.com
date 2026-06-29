import { describe, expect, it } from "vitest";
import type { BookSearchResult } from "../services/rakuten";
import { calculateTechScore, rankTechBooks } from "./tech-book-search";

const TEST_NOW = new Date(2026, 5, 29);

function createBook(overrides: Partial<BookSearchResult>): BookSearchResult {
  return {
    rakutenBooksId: "9780000000000",
    title: "Untitled",
    authors: [],
    publisher: "",
    publishedDate: "2024年1月1日",
    isbn: "9780000000000",
    pageCount: 200,
    description: "",
    thumbnailUrl: "",
    rakutenAffiliateUrl: "",
    ...overrides,
  };
}

function publishedYearsAgo(years: number, now: Date = TEST_NOW): string {
  const date = new Date(now);
  date.setFullYear(date.getFullYear() - years);

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

describe("calculateTechScore", () => {
  it("should add score reasons for technical publishers and keywords", () => {
    const result = calculateTechScore(
      createBook({
        title: "詳解 TypeScript",
        publisher: "技術評論社",
        description: "JavaScriptとReactを使ったWeb開発を解説します",
      }),
      "typescript",
    );

    expect(result.techScore).toBeGreaterThan(0);
    expect(result.scoreReasons).toEqual(
      expect.arrayContaining([
        { type: "tech_publisher", label: "技術評論社", score: 30 },
        { type: "title_keyword", label: "TypeScript", score: 15 },
        { type: "description_keyword", label: "JavaScript", score: 6 },
        { type: "description_keyword", label: "React", score: 6 },
      ]),
    );
    expect(result.scoreReasons).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "description_keyword", label: "Java" }),
      ]),
    );
  });

  it("should strongly prefer exact ISBN matches", () => {
    const result = calculateTechScore(createBook({ isbn: "978-4-87311-565-8" }), "9784873115658");

    expect(result.techScore).toBeGreaterThanOrEqual(100);
    expect(result.scoreReasons[0]).toEqual({
      type: "isbn_exact_match",
      label: "978-4-87311-565-8",
      score: 100,
    });
  });

  it("should penalize non-technical signals", () => {
    const result = calculateTechScore(
      createBook({
        title: "人気漫画で学ぶ旅行レシピ",
        description: "コミックと料理のムック",
      }),
      "旅行",
    );

    expect(result.techScore).toBeLessThan(0);
    expect(result.scoreReasons).toEqual(
      expect.arrayContaining([
        { type: "negative_title_keyword", label: "漫画", score: -40 },
        { type: "negative_title_keyword", label: "レシピ", score: -40 },
        { type: "negative_description_keyword", label: "コミック", score: -15 },
      ]),
    );
  });

  it("should not match short ascii keywords inside unrelated words", () => {
    const result = calculateTechScore(
      createBook({
        title: "Googleサービス仕事術",
        description: "",
      }),
      "google",
    );

    expect(result.scoreReasons).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "title_keyword", label: "Go" })]),
    );
  });

  it("should add recency bonus and old publication penalty", () => {
    const recent = calculateTechScore(
      createBook({ publishedDate: publishedYearsAgo(0) }),
      "query",
      { now: TEST_NOW },
    );
    const old = calculateTechScore(createBook({ publishedDate: publishedYearsAgo(11) }), "query", {
      now: TEST_NOW,
    });

    expect(recent.scoreReasons).toContainEqual({
      type: "recent_publication",
      label: "1年以内",
      score: 12,
    });
    expect(old.scoreReasons).toContainEqual({
      type: "old_publication",
      label: "10年以上前",
      score: -5,
    });
  });
});

describe("rankTechBooks", () => {
  it("should rank technical books before newer non-technical books", () => {
    const ranked = rankTechBooks(
      [
        createBook({
          title: "新しい小説",
          publisher: "一般出版社",
          publishedDate: "2025年1月1日",
        }),
        createBook({
          title: "React設計パターン",
          publisher: "オライリー・ジャパン",
          publishedDate: "2020年1月1日",
        }),
      ],
      "react",
    );

    expect(ranked[0].title).toBe("React設計パターン");
    expect(ranked[0].scoreReasons).toBeUndefined();
  });

  it("should include score reasons when requested", () => {
    const ranked = rankTechBooks(
      [createBook({ title: "Docker入門", publisher: "翔泳社" })],
      "docker",
      { includeReasons: true },
    );

    expect(ranked[0].scoreReasons).toEqual(
      expect.arrayContaining([
        { type: "tech_publisher", label: "翔泳社", score: 30 },
        { type: "title_keyword", label: "Docker", score: 15 },
      ]),
    );
  });

  it("should prefer newer books when technical scores are otherwise similar", () => {
    const ranked = rankTechBooks(
      [
        createBook({
          title: "React設計パターン",
          publisher: "技術評論社",
          publishedDate: publishedYearsAgo(8),
        }),
        createBook({
          title: "React設計パターン 改訂版",
          publisher: "技術評論社",
          publishedDate: publishedYearsAgo(0),
        }),
      ],
      "react",
      { now: TEST_NOW },
    );

    expect(ranked[0].title).toBe("React設計パターン 改訂版");
    expect(ranked[0].techScore).toBeGreaterThan(ranked[1].techScore);
  });
});
