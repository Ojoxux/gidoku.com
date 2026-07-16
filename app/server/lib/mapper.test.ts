import { describe, it, expect } from "vitest";
import {
  toBookInput,
  toBookUpdateInput,
  toBookDto,
  toTagInput,
  toTagDto,
  toUserDto,
} from "./mapper";
import type { Book, Tag, User } from "../../types/database";

describe("toBookInput", () => {
  it("should apply defaults for optional fields", () => {
    const result = toBookInput({ title: "Test Book", authors: ["Author"] }, "user-1");

    expect(result.userId).toBe("user-1");
    expect(result.title).toBe("Test Book");
    expect(result.authors).toEqual(["Author"]);
    expect(result.status).toBe("unread");
    expect(result.currentPage).toBe(0);
    expect(result.pageCount).toBe(0);
    expect(result.publisher).toBeNull();
    expect(result.publishedDate).toBeNull();
    expect(result.isbn).toBeNull();
    expect(result.description).toBeNull();
    expect(result.thumbnailUrl).toBeNull();
    expect(result.rakutenBooksId).toBeNull();
    expect(result.rakutenAffiliateUrl).toBeNull();
    expect(result.memo).toBeNull();
    expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(result.createdAt).toBe(result.updatedAt);
  });

  it("should preserve provided optional fields", () => {
    const result = toBookInput(
      {
        title: "Full Book",
        authors: ["A", "B"],
        publisher: "Publisher",
        pageCount: 300,
        status: "reading",
        currentPage: 50,
      },
      "user-2",
    );

    expect(result.publisher).toBe("Publisher");
    expect(result.pageCount).toBe(300);
    expect(result.status).toBe("reading");
    expect(result.currentPage).toBe(50);
  });
});

describe("toBookUpdateInput", () => {
  it("should strip undefined fields and set updatedAt", () => {
    const result = toBookUpdateInput({
      title: "Updated Title",
      memo: undefined,
    });

    expect(result.title).toBe("Updated Title");
    expect(result).not.toHaveProperty("memo");
    expect(result.updatedAt).toBeTruthy();
  });

  it("should keep zero values", () => {
    const result = toBookUpdateInput({ pageCount: 0 });

    expect(result.pageCount).toBe(0);
  });
});

describe("toBookDto", () => {
  it("should map snake_case DB fields to camelCase API fields", () => {
    const book: Book = {
      id: "book-1",
      user_id: "user-1",
      rakuten_books_id: "rakuten-1",
      title: "Test Book",
      authors: '["Author A","Author B"]',
      publisher: "Publisher",
      published_date: "2024-01-01",
      isbn: "9780000000001",
      page_count: 200,
      description: "Description",
      thumbnail_url: "https://example.com/cover.png",
      rakuten_affiliate_url: "https://example.com/aff",
      status: "reading",
      current_page: 50,
      memo: "Memo",
      finished_at: null,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-02T00:00:00.000Z",
    };

    expect(toBookDto(book)).toEqual({
      id: "book-1",
      userId: "user-1",
      rakutenBooksId: "rakuten-1",
      title: "Test Book",
      authors: ["Author A", "Author B"],
      publisher: "Publisher",
      publishedDate: "2024-01-01",
      isbn: "9780000000001",
      pageCount: 200,
      description: "Description",
      thumbnailUrl: "https://example.com/cover.png",
      rakutenAffiliateUrl: "https://example.com/aff",
      status: "reading",
      currentPage: 50,
      memo: "Memo",
      finishedAt: null,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    });
  });
});

describe("toTagInput", () => {
  it("should create tag input with generated id and timestamp", () => {
    const result = toTagInput({ name: "TypeScript" }, "user-1");

    expect(result.userId).toBe("user-1");
    expect(result.name).toBe("TypeScript");
    expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(result.createdAt).toBeTruthy();
  });
});

describe("toTagDto", () => {
  it("should map tag fields to API response", () => {
    const tag: Tag = {
      id: "tag-1",
      user_id: "user-1",
      name: "Rust",
      created_at: "2024-01-01T00:00:00.000Z",
    };

    expect(toTagDto(tag)).toEqual({
      id: "tag-1",
      userId: "user-1",
      name: "Rust",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
  });
});

describe("toUserDto", () => {
  it("should map user fields to API response", () => {
    const user: User = {
      id: "user-1",
      username: "reader",
      email: "reader@example.com",
      name: "Reader",
      bio: "Bio",
      avatar_url: "https://example.com/avatar.png",
      provider: "github",
      provider_id: "gh-1",
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-02T00:00:00.000Z",
    };

    expect(toUserDto(user)).toEqual({
      id: "user-1",
      username: "reader",
      email: "reader@example.com",
      name: "Reader",
      bio: "Bio",
      avatarUrl: "https://example.com/avatar.png",
      provider: "github",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    });
  });
});
