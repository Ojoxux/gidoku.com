import { describe, it, expect, beforeEach } from "vitest";
import { env } from "cloudflare:test";
import { cleanupDatabase, createTestBook, createTestUser } from "../../test/helpers";
import * as publicProfileService from "./publicProfile";

describe("Public Profile Service", () => {
  beforeEach(async () => {
    await cleanupDatabase(env.DB);
  });

  it("should return public profile books grouped by status", async () => {
    const user = await createTestUser(env.DB);
    const otherUser = await createTestUser(env.DB, {
      username: "other_user",
      email: "other@example.com",
    });

    await createTestBook(env.DB, user.id, {
      title: "Reading Book",
      authors: ["Reading Author"],
      status: "reading",
    });
    await createTestBook(env.DB, user.id, {
      title: "Unread Book",
      authors: ["Unread Author"],
      status: "unread",
    });
    await createTestBook(env.DB, user.id, {
      title: "Completed Book",
      authors: ["Completed Author"],
      status: "completed",
    });
    await createTestBook(env.DB, otherUser.id, {
      title: "Other User Book",
      status: "completed",
    });

    const result = await publicProfileService.getPublicProfileBooks(env.DB, user.id);

    expect(result.stats).toMatchObject({
      total: 3,
      unread: 1,
      reading: 1,
      completed: 1,
    });
    expect(result.readingBooks).toHaveLength(1);
    expect(result.readingBooks[0]).toMatchObject({
      title: "Reading Book",
      authors: ["Reading Author"],
      status: "reading",
    });
    expect(result.unreadBooks).toHaveLength(1);
    expect(result.unreadBooks[0].title).toBe("Unread Book");
    expect(result.completedBooks).toHaveLength(1);
    expect(result.completedBooks[0].title).toBe("Completed Book");
  });

  it("should hide memo from public book responses", async () => {
    const user = await createTestUser(env.DB);

    await createTestBook(env.DB, user.id, {
      status: "unread",
      memo: "private memo",
    });

    const books = await publicProfileService.getPublicBookResponses(env.DB, user.id);

    expect(books).toHaveLength(1);
    expect(books[0].status).toBe("unread");
    expect(books[0].memo).toBeNull();
  });
});
