import type { ApiResponseDto } from "../types/dto";

export async function readApiResponse<T>(
  response: Response
): Promise<ApiResponseDto<T>> {
  return response.json() as Promise<ApiResponseDto<T>>;
}

export function getApiErrorMessage(
  response: ApiResponseDto<unknown>,
  fallback: string
): string {
  return response.success ? fallback : response.error.message || fallback;
}
