import { describe, expect, it } from "vitest";
import type { BookSearchResult } from "../services/rakuten";
import { calculateTechScore, rankTechBooks } from "./tech-book-search";

const TEST_NOW = new Date(2026, 5, 29);

function createBook(overrides: Partial<BookSearchResult> = {}): BookSearchResult {
  return {
    rakutenBooksId: "9780000000000",
    title: "Untitled",
    authors: [],
    publisher: "",
    publishedDate: "",
    isbn: "9780000000000",
    pageCount: 200,
    description: "",
    thumbnailUrl: "",
    rakutenAffiliateUrl: "",
    ...overrides,
  };
}

describe("calculateTechScore", () => {
  it("should add score reasons for technical publishers and keywords", () => {
    const book = createBook({
      title: "詳解 TypeScript",
      publisher: "技術評論社",
      description: "JavaScriptとReactを使ったWeb開発を解説します",
    });

    const result = calculateTechScore(book, "typescript", { now: TEST_NOW });

    expect(result.techScore).toBeGreaterThan(0);
    expect(result.scoreReasons).toEqual(
      expect.arrayContaining([
        { type: "tech_publisher", label: "技術評論社", score: 30 },
        { type: "title_keyword", label: "TypeScript", score: 15 },
        { type: "description_keyword", label: "JavaScript", score: 6 },
        { type: "description_keyword", label: "React", score: 6 },
      ]),
    );
  });

  it.each([
    {
      caseName: "hyphens in the stored ISBN",
      isbn: "978-4-87311-565-8",
      query: "9784873115658",
    },
    {
      caseName: "hyphens in the search query",
      isbn: "9784873115658",
      query: "978-4-87311-565-8",
    },
    {
      caseName: "spaces around ISBN groups",
      isbn: "978 4 87311 565 8",
      query: "9784873115658",
    },
  ])("should add 100 points for an exact ISBN match with $caseName", ({ isbn, query }) => {
    const result = calculateTechScore(createBook({ isbn }), query, { now: TEST_NOW });

    expect(result.scoreReasons).toContainEqual({
      type: "isbn_exact_match",
      label: isbn,
      score: 100,
    });
  });

  it("should not add an ISBN score when the query does not match", () => {
    const result = calculateTechScore(createBook({ isbn: "9784873115658" }), "9784873119038", {
      now: TEST_NOW,
    });

    expect(result.scoreReasons).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "isbn_exact_match" })]),
    );
  });

  it("should not treat empty ISBN values as an exact match", () => {
    const result = calculateTechScore(createBook({ isbn: "" }), "", { now: TEST_NOW });

    expect(result.scoreReasons).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "isbn_exact_match" })]),
    );
  });

  it.each([
    { publisher: "技術評論社", expectedLabel: "技術評論社" },
    { publisher: "技術 評論社", expectedLabel: "技術評論社" },
    { publisher: "日経bp", expectedLabel: "日経BP" },
  ])("should add 30 points for technical publisher $publisher", ({ publisher, expectedLabel }) => {
    const result = calculateTechScore(createBook({ publisher }), "query", { now: TEST_NOW });

    expect(result.scoreReasons).toContainEqual({
      type: "tech_publisher",
      label: expectedLabel,
      score: 30,
    });
  });

  it("should not add a publisher score for an unrelated publisher", () => {
    const result = calculateTechScore(createBook({ publisher: "一般出版社" }), "query", {
      now: TEST_NOW,
    });

    expect(result.scoreReasons).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "tech_publisher" })]),
    );
  });

  it.each([
    {
      caseName: "title",
      overrides: { title: "Docker入門" },
      expectedType: "title_keyword",
      expectedScore: 15,
    },
    {
      caseName: "description",
      overrides: { description: "Dockerを使った開発" },
      expectedType: "description_keyword",
      expectedScore: 6,
    },
    {
      caseName: "authors",
      overrides: { authors: ["Docker研究会"] },
      expectedType: "author_keyword",
      expectedScore: 4,
    },
  ])(
    "should detect a technical keyword in $caseName",
    ({ overrides, expectedType, expectedScore }) => {
      const result = calculateTechScore(createBook(overrides), "query", { now: TEST_NOW });

      expect(result.scoreReasons).toContainEqual({
        type: expectedType,
        label: "Docker",
        score: expectedScore,
      });
    },
  );

  it("should match ASCII keywords without case sensitivity", () => {
    const result = calculateTechScore(createBook({ title: "docker入門" }), "query", {
      now: TEST_NOW,
    });

    expect(result.scoreReasons).toContainEqual({
      type: "title_keyword",
      label: "Docker",
      score: 15,
    });
  });

  it.each([
    { title: "Googleサービス仕事術", unrelatedKeyword: "Go" },
    { title: "JavaScript入門", unrelatedKeyword: "Java" },
  ])(
    "should not match $unrelatedKeyword inside an unrelated word",
    ({ title, unrelatedKeyword }) => {
      const result = calculateTechScore(createBook({ title }), "query", { now: TEST_NOW });

      expect(result.scoreReasons).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: "title_keyword", label: unrelatedKeyword }),
        ]),
      );
    },
  );

  it.each([
    { title: "Web開発入門", expectedKeyword: "Web開発", overlappingKeyword: "Web" },
    { title: "生成AI入門", expectedKeyword: "生成AI", overlappingKeyword: "AI" },
  ])(
    "should prefer $expectedKeyword over the overlapping keyword $overlappingKeyword",
    ({ title, expectedKeyword, overlappingKeyword }) => {
      const result = calculateTechScore(createBook({ title }), "query", { now: TEST_NOW });

      expect(result.techScore).toBe(15);
      expect(result.scoreReasons).toContainEqual({
        type: "title_keyword",
        label: expectedKeyword,
        score: 15,
      });
      expect(result.scoreReasons).not.toContainEqual({
        type: "title_keyword",
        label: overlappingKeyword,
        score: 15,
      });
    },
  );

  it("should score distinct technical keywords independently", () => {
    const result = calculateTechScore(createBook({ title: "React TypeScript入門" }), "query", {
      now: TEST_NOW,
    });

    expect(result.techScore).toBe(30);
    expect(result.scoreReasons).toEqual(
      expect.arrayContaining([
        { type: "title_keyword", label: "React", score: 15 },
        { type: "title_keyword", label: "TypeScript", score: 15 },
      ]),
    );
  });

  it("should score a standalone keyword separately from an overlapping occurrence", () => {
    const result = calculateTechScore(createBook({ title: "AIと生成AI" }), "query", {
      now: TEST_NOW,
    });

    expect(result.techScore).toBe(30);
    expect(result.scoreReasons).toEqual(
      expect.arrayContaining([
        { type: "title_keyword", label: "AI", score: 15 },
        { type: "title_keyword", label: "生成AI", score: 15 },
      ]),
    );
  });

  it.each([
    { keyword: "漫画", score: -40 },
    { keyword: "小説", score: -40 },
    { keyword: "レシピ", score: -40 },
  ])("should penalize the non-technical title keyword $keyword", ({ keyword, score }) => {
    const result = calculateTechScore(createBook({ title: `${keyword}入門` }), "query", {
      now: TEST_NOW,
    });

    expect(result.scoreReasons).toContainEqual({
      type: "negative_title_keyword",
      label: keyword,
      score,
    });
  });

  it.each([
    { keyword: "コミック", score: -15 },
    { keyword: "料理", score: -15 },
    { keyword: "雑誌", score: -15 },
  ])("should penalize the non-technical description keyword $keyword", ({ keyword, score }) => {
    const result = calculateTechScore(
      createBook({ description: `${keyword}として紹介` }),
      "query",
      {
        now: TEST_NOW,
      },
    );

    expect(result.scoreReasons).toContainEqual({
      type: "negative_description_keyword",
      label: keyword,
      score,
    });
  });

  it.each([
    { title: "Reactムック", technicalKeyword: "React" },
    { title: "基本情報技術者 ポケット攻略本", technicalKeyword: "基本情報" },
  ])("should not penalize the technical book title $title", ({ title, technicalKeyword }) => {
    const result = calculateTechScore(createBook({ title }), "query", { now: TEST_NOW });

    expect(result.techScore).toBe(15);
    expect(result.scoreReasons).toContainEqual({
      type: "title_keyword",
      label: technicalKeyword,
      score: 15,
    });
    expect(result.scoreReasons).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "negative_title_keyword" })]),
    );
  });

  it("should continue to penalize a game guide title", () => {
    const result = calculateTechScore(createBook({ title: "ゲーム攻略本" }), "query", {
      now: TEST_NOW,
    });

    expect(result.techScore).toBe(-40);
    expect(result.scoreReasons).toContainEqual({
      type: "negative_title_keyword",
      label: "ゲーム攻略",
      score: -40,
    });
  });

  it("should sum positive and negative score rules", () => {
    const result = calculateTechScore(createBook({ title: "Dockerレシピ" }), "query", {
      now: TEST_NOW,
    });

    expect(result.techScore).toBe(-25);
    expect(result.scoreReasons).toEqual(
      expect.arrayContaining([
        { type: "title_keyword", label: "Docker", score: 15 },
        { type: "negative_title_keyword", label: "レシピ", score: -40 },
      ]),
    );
  });

  it("should penalize a missing page count", () => {
    const result = calculateTechScore(createBook({ pageCount: 0 }), "query", { now: TEST_NOW });

    expect(result.techScore).toBe(-5);
    expect(result.scoreReasons).toContainEqual({
      type: "missing_page_count",
      label: "pageCount",
      score: -5,
    });
  });

  it("should not penalize a book with a page count", () => {
    const result = calculateTechScore(createBook({ pageCount: 1 }), "query", { now: TEST_NOW });

    expect(result.techScore).toBe(0);
    expect(result.scoreReasons).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "missing_page_count" })]),
    );
  });

  it("should return zero when the book has no scoring signals", () => {
    const result = calculateTechScore(createBook(), "query", { now: TEST_NOW });

    expect(result).toEqual({ techScore: 0, scoreReasons: [] });
  });

  it.each([
    {
      publishedDate: "2026年6月29日",
      expectedReason: { type: "recent_publication", label: "1年以内", score: 12 },
    },
    {
      publishedDate: "2025年6月30日",
      expectedReason: { type: "recent_publication", label: "1年以内", score: 12 },
    },
    {
      publishedDate: "2025年6月28日",
      expectedReason: { type: "recent_publication", label: "3年以内", score: 8 },
    },
    {
      publishedDate: "2023年6月30日",
      expectedReason: { type: "recent_publication", label: "3年以内", score: 8 },
    },
    {
      publishedDate: "2023年6月28日",
      expectedReason: { type: "recent_publication", label: "5年以内", score: 4 },
    },
    {
      publishedDate: "2021年6月30日",
      expectedReason: { type: "recent_publication", label: "5年以内", score: 4 },
    },
    { publishedDate: "2020年6月29日", expectedReason: null },
    {
      publishedDate: "2016年6月28日",
      expectedReason: { type: "old_publication", label: "10年以上前", score: -5 },
    },
  ])(
    "should classify publication date $publishedDate at a recency boundary",
    ({ publishedDate, expectedReason }) => {
      const result = calculateTechScore(createBook({ publishedDate }), "query", {
        now: TEST_NOW,
      });

      if (expectedReason) {
        expect(result.scoreReasons).toContainEqual(expectedReason);
      } else {
        expect(result.scoreReasons).toEqual([]);
      }
    },
  );

  it.each(["", "unknown", "2026/06/29"])(
    "should ignore unsupported publication date %s",
    (publishedDate) => {
      const result = calculateTechScore(createBook({ publishedDate }), "query", {
        now: TEST_NOW,
      });

      expect(result.scoreReasons).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: expect.stringMatching(/^(recent|old)_publication$/),
          }),
        ]),
      );
    },
  );
});

describe("rankTechBooks", () => {
  it("should rank a technical book before a newer non-technical book", () => {
    const books = [
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
    ];

    const ranked = rankTechBooks(books, "react", { now: TEST_NOW });

    expect(ranked[0].title).toBe("React設計パターン");
    expect(ranked[0].techScore).toBeGreaterThan(ranked[1].techScore);
  });

  it("should sort books by technical score in descending order", () => {
    const books = [
      createBook({ title: "Neutral Book" }),
      createBook({ title: "Docker入門" }),
      createBook({ title: "TypeScript入門", publisher: "技術評論社" }),
    ];

    const ranked = rankTechBooks(books, "query", { now: TEST_NOW });

    expect(ranked.map((book) => book.title)).toEqual([
      "TypeScript入門",
      "Docker入門",
      "Neutral Book",
    ]);
  });

  it("should prefer the newer publication when technical scores are tied", () => {
    const books = [
      createBook({ title: "Older", publishedDate: "2019年1月1日" }),
      createBook({ title: "Newer", publishedDate: "2020年1月1日" }),
    ];

    const ranked = rankTechBooks(books, "query", { now: TEST_NOW });

    expect(ranked.map((book) => book.title)).toEqual(["Newer", "Older"]);
    expect(ranked[0].techScore).toBe(ranked[1].techScore);
  });

  it("should place an unknown publication date after a valid date when scores are tied", () => {
    const books = [
      createBook({ title: "Unknown", publishedDate: "unknown" }),
      createBook({ title: "Known", publishedDate: "2020年1月1日" }),
    ];

    const ranked = rankTechBooks(books, "query", { now: TEST_NOW });

    expect(ranked.map((book) => book.title)).toEqual(["Known", "Unknown"]);
  });

  it("should omit score reasons by default", () => {
    const ranked = rankTechBooks([createBook({ title: "Docker入門" })], "docker", {
      now: TEST_NOW,
    });

    expect(ranked[0].techScore).toBeGreaterThan(0);
    expect(ranked[0].scoreReasons).toBeUndefined();
  });

  it("should include score reasons when requested", () => {
    const ranked = rankTechBooks(
      [createBook({ title: "Docker入門", publisher: "翔泳社" })],
      "docker",
      { includeReasons: true, now: TEST_NOW },
    );

    expect(ranked[0].scoreReasons).toEqual(
      expect.arrayContaining([
        { type: "tech_publisher", label: "翔泳社", score: 30 },
        { type: "title_keyword", label: "Docker", score: 15 },
      ]),
    );
  });

  it("should not mutate the input array or its books", () => {
    const books = [createBook({ title: "Neutral Book" }), createBook({ title: "Docker入門" })];
    const originalBooks = structuredClone(books);

    const ranked = rankTechBooks(books, "query", { now: TEST_NOW });

    expect(books).toEqual(originalBooks);
    expect(ranked).not.toBe(books);
    expect(ranked.every((book) => !books.includes(book))).toBe(true);
  });

  it("should return an empty array for an empty search result", () => {
    const ranked = rankTechBooks([], "query", { now: TEST_NOW });

    expect(ranked).toEqual([]);
  });

  it("should add a technical score to a single book", () => {
    const ranked = rankTechBooks([createBook({ title: "Docker入門" })], "query", {
      now: TEST_NOW,
    });

    expect(ranked).toHaveLength(1);
    expect(ranked[0]).toMatchObject({ title: "Docker入門", techScore: 15 });
  });
});
