export interface BookSearchResultDto {
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

export interface ScoreReasonDto {
  type: string;
  label: string;
  score: number;
}

export interface ScoredBookSearchResultDto extends BookSearchResultDto {
  techScore: number;
  scoreReasons?: ScoreReasonDto[];
}

export interface SearchBooksResponseDto {
  results: ScoredBookSearchResultDto[];
  hits: number;
  pageCount: number;
  currentPage: number;
}

export type SearchBookByIsbnResponseDto = BookSearchResultDto | null;
