export interface ApiErrorDto {
  message: string;
  code?: string;
  details?: unknown;
}

export type ApiResponseDto<T = unknown> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: ApiErrorDto;
    };

export type SuccessResponseDto<T = unknown> = Extract<ApiResponseDto<T>, { success: true }>;

export type ErrorResponseDto = Extract<ApiResponseDto, { success: false }>;

export interface PaginatedDto<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface DeletedResponseDto {
  deleted: boolean;
}
