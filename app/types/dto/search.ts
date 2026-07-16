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

export interface SearchBooksResponseDto {
  results: BookSearchResultDto[];
  hits: number;
  pageCount: number;
  currentPage: number;
}

export type SearchBookByIsbnResponseDto = BookSearchResultDto | null;
