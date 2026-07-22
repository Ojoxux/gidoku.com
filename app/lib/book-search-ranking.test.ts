import { describe, expect, it } from "vitest";
import { mergeRankedSearchResults } from "./book-search-ranking";

interface TestSearchResult {
  title: string;
  techScore: number;
  publishedDate: string;
}

describe("mergeRankedSearchResults", () => {
  it("should sort results from multiple pages by technical score", () => {
    const currentResults: TestSearchResult[] = [
      { title: "Medium", techScore: 20, publishedDate: "2025年1月1日" },
      { title: "Low", techScore: -40, publishedDate: "2026年1月1日" },
    ];
    const additionalResults: TestSearchResult[] = [
      { title: "High", techScore: 50, publishedDate: "2020年1月1日" },
    ];

    const merged = mergeRankedSearchResults(currentResults, additionalResults);

    expect(merged.map((result) => result.title)).toEqual(["High", "Medium", "Low"]);
  });

  it("should prefer newer publications when technical scores are tied", () => {
    const currentResults: TestSearchResult[] = [
      { title: "Older", techScore: 15, publishedDate: "2020年1月1日" },
    ];
    const additionalResults: TestSearchResult[] = [
      { title: "Unknown", techScore: 15, publishedDate: "unknown" },
      { title: "Newer", techScore: 15, publishedDate: "2025年1月1日" },
    ];

    const merged = mergeRankedSearchResults(currentResults, additionalResults);

    expect(merged.map((result) => result.title)).toEqual(["Newer", "Older", "Unknown"]);
  });

  it("should not mutate either input array", () => {
    const currentResults: TestSearchResult[] = [
      { title: "Current", techScore: 0, publishedDate: "2025年1月1日" },
    ];
    const additionalResults: TestSearchResult[] = [
      { title: "Additional", techScore: 30, publishedDate: "2024年1月1日" },
    ];
    const originalCurrentResults = structuredClone(currentResults);
    const originalAdditionalResults = structuredClone(additionalResults);

    mergeRankedSearchResults(currentResults, additionalResults);

    expect(currentResults).toEqual(originalCurrentResults);
    expect(additionalResults).toEqual(originalAdditionalResults);
  });
});
