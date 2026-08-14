export interface RankedSearchResult {
  isbn: string;
  techScore: number;
  publishedDate: string;
}

export function mergeRankedSearchResults<T extends RankedSearchResult>(
  currentResults: T[],
  additionalResults: T[],
): T[] {
  const seenIsbns = new Set<string>();

  return [...currentResults, ...additionalResults]
    .filter((result) => {
      const isbn = result.isbn.replace(/[-\s]/g, "");
      if (!isbn) return true;
      if (seenIsbns.has(isbn)) return false;

      seenIsbns.add(isbn);
      return true;
    })
    .toSorted(compareRankedSearchResults);
}

export function compareRankedSearchResults(
  before: RankedSearchResult,
  after: RankedSearchResult,
): number {
  if (before.techScore !== after.techScore) {
    return after.techScore - before.techScore;
  }

  return comparePublishedDateDesc(before.publishedDate, after.publishedDate);
}

export function parsePublishedDate(publishedDate: string): Date | null {
  if (!publishedDate) return null;

  const match = publishedDate.match(/(\d{4})年(?:\s*(\d{1,2})月)?(?:\s*(\d{1,2})日)?/);
  if (!match) return null;

  const [, year, month, day] = match;

  return new Date(Number(year), Number(month ?? 1) - 1, Number(day ?? 1));
}

function comparePublishedDateDesc(before: string, after: string): number {
  const beforeDate = parsePublishedDate(before);
  const afterDate = parsePublishedDate(after);

  if (!beforeDate && !afterDate) return 0;
  if (!beforeDate) return 1;
  if (!afterDate) return -1;

  return afterDate.getTime() - beforeDate.getTime();
}
