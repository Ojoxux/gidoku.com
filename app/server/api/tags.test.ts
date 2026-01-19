import { describe, it, expect, beforeEach } from 'vitest'
import { env } from 'cloudflare:test'
import api from './index'
import { createTestUser, createTestSession, createTestBook, createTestTag } from '../../test/helpers'
import type { SuccessResponse } from '../lib/response'
import type { TagResponse } from '../../types/database'

describe('Tags API Integration', () => {
  let userId: string
  let sessionId: string

  beforeEach(async () => {
    await env.DB.prepare('DELETE FROM book_tags').run()
    await env.DB.prepare('DELETE FROM tags').run()
    await env.DB.prepare('DELETE FROM books').run()
    await env.DB.prepare('DELETE FROM users').run()

    const user = await createTestUser(env.DB)
    userId = user.id
    sessionId = await createTestSession(env.KV, userId)
  })

  describe('GET /tags', () => {
    it('should return empty list when no tags', async () => {
      const res = await api.request('/tags', {
        headers: { Cookie: `session_id=${sessionId}` },
      }, env)

      expect(res.status).toBe(200)
      const body = await res.json() as SuccessResponse<TagResponse[]>
      expect(body.success).toBe(true)
      expect(body.data).toEqual([])
    })

    it('should return tags for authenticated user', async () => {
      await createTestTag(env.DB, userId, 'JavaScript')
      await createTestTag(env.DB, userId, 'TypeScript')

      const res = await api.request('/tags', {
        headers: { Cookie: `session_id=${sessionId}` },
      }, env)

      expect(res.status).toBe(200)
      const body = await res.json() as SuccessResponse<TagResponse[]>
      expect(body.data).toHaveLength(2)
    })
  })

  describe('POST /tags', () => {
    it('should create a new tag', async () => {
      const res = await api.request('/tags', {
        method: 'POST',
        headers: {
          Cookie: `session_id=${sessionId}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'React' }),
      }, env)

      expect(res.status).toBe(201)
      const body = await res.json() as SuccessResponse<TagResponse>
      expect(body.success).toBe(true)
      expect(body.data.name).toBe('React')
    })
  })

  describe('PUT /tags/:id', () => {
    it('should update a tag', async () => {
      const tag = await createTestTag(env.DB, userId, 'OldName')

      const res = await api.request(`/tags/${tag.id}`, {
        method: 'PUT',
        headers: {
          Cookie: `session_id=${sessionId}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'NewName' }),
      }, env)

      expect(res.status).toBe(200)
      const body = await res.json() as SuccessResponse<TagResponse>
      expect(body.data.name).toBe('NewName')
    })
  })

  describe('DELETE /tags/:id', () => {
    it('should delete a tag', async () => {
      const tag = await createTestTag(env.DB, userId, 'ToDelete')

      const res = await api.request(`/tags/${tag.id}`, {
        method: 'DELETE',
        headers: { Cookie: `session_id=${sessionId}` },
      }, env)

      expect(res.status).toBe(200)
      const body = await res.json() as SuccessResponse<{ deleted: boolean }>
      expect(body.data.deleted).toBe(true)
    })
  })

  describe('Book-Tag Association', () => {
    it('should get tags for a book', async () => {
      const book = await createTestBook(env.DB, userId)
      const tag = await createTestTag(env.DB, userId, 'BookTag')
      await env.DB.prepare('INSERT INTO book_tags (book_id, tag_id) VALUES (?, ?)').bind(book.id, tag.id).run()

      const res = await api.request(`/tags/books/${book.id}`, {
        headers: { Cookie: `session_id=${sessionId}` },
      }, env)

      expect(res.status).toBe(200)
      const body = await res.json() as SuccessResponse<TagResponse[]>
      expect(body.data).toHaveLength(1)
    })

    it('should remove tag from book', async () => {
      const book = await createTestBook(env.DB, userId)
      const tag = await createTestTag(env.DB, userId, 'ToRemove')
      await env.DB.prepare('INSERT INTO book_tags (book_id, tag_id) VALUES (?, ?)').bind(book.id, tag.id).run()

      const res = await api.request(`/tags/books/${book.id}/${tag.id}`, {
        method: 'DELETE',
        headers: { Cookie: `session_id=${sessionId}` },
      }, env)

      expect(res.status).toBe(200)
      const body = await res.json() as SuccessResponse<{ removed: boolean }>
      expect(body.data.removed).toBe(true)
    })
  })
})
