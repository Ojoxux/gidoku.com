import { describe, expect, it } from "vitest";
import { mergeRankedSearchResults } from "./book-search-ranking";

interface TestSearchResult {
  isbn: string;
  title: string;
  techScore: number;
  publishedDate: string;
}

describe("mergeRankedSearchResults", () => {
  it("should sort results from multiple pages by technical score", () => {
    const currentResults: TestSearchResult[] = [
      { isbn: "1", title: "Medium", techScore: 20, publishedDate: "2025年1月1日" },
      { isbn: "2", title: "Low", techScore: -40, publishedDate: "2026年1月1日" },
    ];
    const additionalResults: TestSearchResult[] = [
      { isbn: "3", title: "High", techScore: 50, publishedDate: "2020年1月1日" },
    ];

    const merged = mergeRankedSearchResults(currentResults, additionalResults);

    expect(merged.map((result) => result.title)).toEqual(["High", "Medium", "Low"]);
  });

  it("should prefer newer publications when technical scores are tied", () => {
    const currentResults: TestSearchResult[] = [
      { isbn: "1", title: "Older", techScore: 15, publishedDate: "2020年1月1日" },
    ];
    const additionalResults: TestSearchResult[] = [
      { isbn: "2", title: "Unknown", techScore: 15, publishedDate: "unknown" },
      { isbn: "3", title: "Newer", techScore: 15, publishedDate: "2025年1月1日" },
    ];

    const merged = mergeRankedSearchResults(currentResults, additionalResults);

    expect(merged.map((result) => result.title)).toEqual(["Newer", "Older", "Unknown"]);
  });

  it("should not mutate either input array", () => {
    const currentResults: TestSearchResult[] = [
      { isbn: "1", title: "Current", techScore: 0, publishedDate: "2025年1月1日" },
    ];
    const additionalResults: TestSearchResult[] = [
      { isbn: "2", title: "Additional", techScore: 30, publishedDate: "2024年1月1日" },
    ];
    const originalCurrentResults = structuredClone(currentResults);
    const originalAdditionalResults = structuredClone(additionalResults);

    mergeRankedSearchResults(currentResults, additionalResults);

    expect(currentResults).toEqual(originalCurrentResults);
    expect(additionalResults).toEqual(originalAdditionalResults);
  });

  it("should remove duplicate ISBNs across pages", () => {
    const currentResults: TestSearchResult[] = [
      {
        isbn: "978-4-1234-5678-9",
        title: "Current",
        techScore: 10,
        publishedDate: "2024年1月1日",
      },
    ];
    const additionalResults: TestSearchResult[] = [
      {
        isbn: "9784123456789",
        title: "Duplicate",
        techScore: 20,
        publishedDate: "2025年1月1日",
      },
    ];

    const merged = mergeRankedSearchResults(currentResults, additionalResults);

    expect(merged.map((result) => result.title)).toEqual(["Current"]);
  });

  it("should keep results without an ISBN", () => {
    const currentResults: TestSearchResult[] = [
      { isbn: "", title: "Current", techScore: 10, publishedDate: "2024年1月1日" },
    ];
    const additionalResults: TestSearchResult[] = [
      { isbn: "", title: "Additional", techScore: 20, publishedDate: "2025年1月1日" },
    ];

    const merged = mergeRankedSearchResults(currentResults, additionalResults);

    expect(merged.map((result) => result.title)).toEqual(["Additional", "Current"]);
  });
});
