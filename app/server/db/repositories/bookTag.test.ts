import { describe, it, expect, beforeEach } from 'vitest'
import { env } from 'cloudflare:test'
import * as bookTagRepo from './bookTag'
import { createTestBook, createTestTag, createTestUser, cleanupDatabase } from '../../../test/helpers'

describe('BookTag Repository', () => {
  let userId: string
  let bookId: string
  let tagId: string

  beforeEach(async () => {
    await cleanupDatabase(env.DB)
    const user = await createTestUser(env.DB)
    userId = user.id
    const book = await createTestBook(env.DB, userId)
    bookId = book.id
    const tag = await createTestTag(env.DB, userId, 'OwnedTag')
    tagId = tag.id
  })

  it('should add a tag to a book', async () => {
    await bookTagRepo.addTagToBook(env.DB, bookId, tagId, userId)

    const attached = await bookTagRepo.isTagAttached(env.DB, bookId, tagId)
    expect(attached).toBe(true)
  })

  it('should ignore duplicate tag attachment', async () => {
    await bookTagRepo.addTagToBook(env.DB, bookId, tagId, userId)
    await bookTagRepo.addTagToBook(env.DB, bookId, tagId, userId)

    const count = await bookTagRepo.countTagsByBook(env.DB, bookId)
    expect(count).toBe(1)
  })

  it('should remove tag from book', async () => {
    await bookTagRepo.addTagToBook(env.DB, bookId, tagId, userId)
    await bookTagRepo.removeTagFromBook(env.DB, bookId, tagId, userId)

    const attached = await bookTagRepo.isTagAttached(env.DB, bookId, tagId)
    expect(attached).toBe(false)
  })

  it('should reject adding tag for missing book', async () => {
    await expect(
      bookTagRepo.addTagToBook(env.DB, 'missing-book', tagId, userId)
    ).rejects.toThrow('Book not found')
  })

  it('should reject adding tag for missing tag', async () => {
    await expect(
      bookTagRepo.addTagToBook(env.DB, bookId, 'missing-tag', userId)
    ).rejects.toThrow('Tag not found')
  })

  it('should reject adding tag for other user book', async () => {
    const otherUser = await createTestUser(env.DB)
    const otherBook = await createTestBook(env.DB, otherUser.id)

    await expect(
      bookTagRepo.addTagToBook(env.DB, otherBook.id, tagId, userId)
    ).rejects.toThrow("You don't own this book")
  })

  it('should reject adding tag for other user tag', async () => {
    const otherUser = await createTestUser(env.DB)
    const otherTag = await createTestTag(env.DB, otherUser.id, 'OtherTag')

    await expect(
      bookTagRepo.addTagToBook(env.DB, bookId, otherTag.id, userId)
    ).rejects.toThrow("You don't own this tag")
  })

  it('should return tags for a book', async () => {
    await bookTagRepo.addTagToBook(env.DB, bookId, tagId, userId)

    const tags = await bookTagRepo.findTagsByBookId(env.DB, bookId)
    expect(tags).toHaveLength(1)
    expect(tags[0].id).toBe(tagId)
  })

  it('should count tags and books', async () => {
    await bookTagRepo.addTagToBook(env.DB, bookId, tagId, userId)

    const tagCount = await bookTagRepo.countTagsByBook(env.DB, bookId)
    const bookCount = await bookTagRepo.countBooksByTag(env.DB, tagId)

    expect(tagCount).toBe(1)
    expect(bookCount).toBe(1)
  })

  it('should update book tags in bulk', async () => {
    const extraTag = await createTestTag(env.DB, userId, 'ExtraTag')

    await bookTagRepo.updateBookTags(env.DB, bookId, [tagId, extraTag.id])

    const tagCount = await bookTagRepo.countTagsByBook(env.DB, bookId)
    expect(tagCount).toBe(2)

    await bookTagRepo.updateBookTags(env.DB, bookId, [extraTag.id])
    const tags = await bookTagRepo.findTagsByBookId(env.DB, bookId)
    expect(tags).toHaveLength(1)
    expect(tags[0].id).toBe(extraTag.id)
  })
})
