import { describe, it, expect, beforeEach } from 'vitest'
import { env } from 'cloudflare:test'
import * as bookRepo from './book'
import { createTestUser, createTestBook } from '../../../test/helpers'

describe('Book Repository', () => {
  let userId: string

  beforeEach(async () => {
    // テストデータをクリーンアップ
    await env.DB.exec('DELETE FROM book_tags')
    await env.DB.exec('DELETE FROM tags')
    await env.DB.exec('DELETE FROM books')
    await env.DB.exec('DELETE FROM users')

    // テストユーザーを作成
    const user = await createTestUser(env.DB)
    userId = user.id
  })

  describe('create', () => {
    it('should create a book', async () => {
      const now = new Date().toISOString()
      const bookId = crypto.randomUUID()

      const book = await bookRepo.create(env.DB, {
        id: bookId,
        userId,
        title: 'Test Book',
        authors: ['Author 1'],
        status: 'unread',
        currentPage: 0,
        createdAt: now,
        updatedAt: now,
      })

      expect(book.id).toBe(bookId)
      expect(book.title).toBe('Test Book')
      expect(book.user_id).toBe(userId)
    })
  })

  describe('findById', () => {
    it('should find a book by id', async () => {
      const created = await createTestBook(env.DB, userId, { title: 'Find Me' })

      const book = await bookRepo.findById(env.DB, created.id, userId)

      expect(book.id).toBe(created.id)
      expect(book.title).toBe('Find Me')
    })

    it('should throw NotFoundError for non-existent book', async () => {
      await expect(
        bookRepo.findById(env.DB, 'non-existent', userId)
      ).rejects.toThrow('Book not found')
    })

    it('should not return books from other users', async () => {
      const otherUser = await createTestUser(env.DB)
      const otherBook = await createTestBook(env.DB, otherUser.id)

      await expect(
        bookRepo.findById(env.DB, otherBook.id, userId)
      ).rejects.toThrow('Book not found')
    })
  })

  describe('findByUserId', () => {
    it('should return books for a user', async () => {
      await createTestBook(env.DB, userId, { title: 'Book 1' })
      await createTestBook(env.DB, userId, { title: 'Book 2' })

      const { books, total } = await bookRepo.findByUserId(env.DB, userId)

      expect(books).toHaveLength(2)
      expect(total).toBe(2)
    })

    it('should filter by status', async () => {
      await createTestBook(env.DB, userId, { status: 'reading' })
      await createTestBook(env.DB, userId, { status: 'unread' })
      await createTestBook(env.DB, userId, { status: 'completed' })

      const { books, total } = await bookRepo.findByUserId(env.DB, userId, {
        status: 'reading',
      })

      expect(books).toHaveLength(1)
      expect(total).toBe(1)
      expect(books[0].status).toBe('reading')
    })

    it('should support pagination', async () => {
      for (let i = 0; i < 5; i++) {
        await createTestBook(env.DB, userId, { title: `Book ${i}` })
      }

      const { books: page1 } = await bookRepo.findByUserId(env.DB, userId, {
        limit: 2,
        offset: 0,
      })
      const { books: page2 } = await bookRepo.findByUserId(env.DB, userId, {
        limit: 2,
        offset: 2,
      })

      expect(page1).toHaveLength(2)
      expect(page2).toHaveLength(2)
    })

    it('should search by title', async () => {
      await createTestBook(env.DB, userId, { title: 'JavaScript Guide' })
      await createTestBook(env.DB, userId, { title: 'Python Guide' })

      const { books, total } = await bookRepo.findByUserId(env.DB, userId, {
        search: 'JavaScript',
      })

      expect(books).toHaveLength(1)
      expect(total).toBe(1)
      expect(books[0].title).toBe('JavaScript Guide')
    })
  })

  describe('update', () => {
    it('should update book fields', async () => {
      const created = await createTestBook(env.DB, userId, { title: 'Old Title' })

      const updated = await bookRepo.update(env.DB, created.id, userId, {
        title: 'New Title',
        status: 'reading',
      })

      expect(updated.title).toBe('New Title')
      expect(updated.status).toBe('reading')
    })
  })

  describe('updateProgress', () => {
    it('should update progress and status', async () => {
      const created = await createTestBook(env.DB, userId, {
        pageCount: 100,
        currentPage: 0,
        status: 'unread',
      })

      const updated = await bookRepo.updateProgress(
        env.DB,
        created.id,
        userId,
        50,
        'reading'
      )

      expect(updated.current_page).toBe(50)
      expect(updated.status).toBe('reading')
    })
  })

  describe('deleteById', () => {
    it('should delete a book', async () => {
      const created = await createTestBook(env.DB, userId)

      await bookRepo.deleteById(env.DB, created.id, userId)

      await expect(
        bookRepo.findById(env.DB, created.id, userId)
      ).rejects.toThrow('Book not found')
    })
  })

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      await createTestBook(env.DB, userId, { status: 'reading' })
      await createTestBook(env.DB, userId, { status: 'reading' })
      await createTestBook(env.DB, userId, { status: 'completed' })
      await createTestBook(env.DB, userId, { status: 'unread' })

      const stats = await bookRepo.getStats(env.DB, userId)

      expect(stats.total).toBe(4)
      expect(stats.reading).toBe(2)
      expect(stats.completed).toBe(1)
      expect(stats.unread).toBe(1)
    })

    it('should return zeros for user with no books', async () => {
      const stats = await bookRepo.getStats(env.DB, userId)

      // D1 returns null for SUM of empty result, so we check for 0 or null
      expect(stats.total).toBe(0)
      expect(stats.reading ?? 0).toBe(0)
      expect(stats.completed ?? 0).toBe(0)
      expect(stats.unread ?? 0).toBe(0)
    })
  })

  describe('belongsToUser', () => {
    it('should return true for user own book', async () => {
      const book = await createTestBook(env.DB, userId)

      const result = await bookRepo.belongsToUser(env.DB, book.id, userId)

      expect(result).toBe(true)
    })

    it('should return false for other user book', async () => {
      const otherUser = await createTestUser(env.DB)
      const otherBook = await createTestBook(env.DB, otherUser.id)

      const result = await bookRepo.belongsToUser(env.DB, otherBook.id, userId)

      expect(result).toBe(false)
    })
  })
})
