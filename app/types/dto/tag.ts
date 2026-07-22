export interface TagDto {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface CreateTagRequestDto {
  name: string;
}

export interface UpdateTagRequestDto {
  name: string;
}

export interface AddBookTagRequestDto {
  tagId: string;
}

export interface AddBookTagResponseDto {
  added: boolean;
}

export interface RemoveBookTagResponseDto {
  removed: boolean;
}
