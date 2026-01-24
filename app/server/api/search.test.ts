import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { env } from 'cloudflare:test'
import api from './index'
import { createTestSession, createTestUser, cleanupDatabase } from '../../test/helpers'

describe('Search API Integration', () => {
  beforeEach(async () => {
    await cleanupDatabase(env.DB)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return 401 without session', async () => {
    const res = await api.request('/search/books?query=react', {}, env)
    expect(res.status).toBe(401)
  })

  it('should return 400 for invalid query', async () => {
    const user = await createTestUser(env.DB)
    const sessionId = await createTestSession(env.KV, user.id)

    const res = await api.request('/search/books?query=', {
      headers: { Cookie: `session_id=${sessionId}` },
    }, env)

    expect(res.status).toBe(400)
  })

  it('should return search results sorted by published date', async () => {
    const user = await createTestUser(env.DB)
    const sessionId = await createTestSession(env.KV, user.id)

    const mockResponse = {
      Items: [
        {
          Item: {
            isbn: '9780000000001',
            title: 'Older Book',
            author: 'Author A',
            publisherName: 'Publisher A',
            salesDate: '2023年12月1日',
            size: '200p',
            itemCaption: 'Older book description',
            largeImageUrl: 'https://example.com/older.png',
            affiliateUrl: 'https://example.com/older',
          },
        },
        {
          Item: {
            isbn: '9780000000002',
            title: 'Newer Book',
            author: 'Author B',
            publisherName: 'Publisher B',
            salesDate: '2024年1月2日',
            size: '320p',
            itemCaption: 'Newer book description',
            largeImageUrl: 'https://example.com/newer.png',
            affiliateUrl: 'https://example.com/newer',
          },
        },
      ],
      pageCount: 1,
      hits: 2,
    }

    vi.stubGlobal('fetch', vi.fn(async () =>
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    ))

    const res = await api.request('/search/books?query=react&limit=5&page=1', {
      headers: { Cookie: `session_id=${sessionId}` },
    }, env)

    expect(res.status).toBe(200)
    const body = await res.json() as {
      success: boolean
      data: { results: Array<{ title: string; publishedDate: string }>; hits: number; pageCount: number }
    }
    expect(body.success).toBe(true)
    expect(body.data.results).toHaveLength(2)
    expect(body.data.results[0].title).toBe('Newer Book')
    expect(body.data.results[0].publishedDate).toBe('2024年1月2日')
    expect(body.data.hits).toBe(2)
    expect(body.data.pageCount).toBe(1)
  })

  it('should return 400 for invalid isbn', async () => {
    const user = await createTestUser(env.DB)
    const sessionId = await createTestSession(env.KV, user.id)

    const res = await api.request('/search/isbn/123', {
      headers: { Cookie: `session_id=${sessionId}` },
    }, env)

    expect(res.status).toBe(400)
  })

  it('should return null when ISBN search has no results', async () => {
    const user = await createTestUser(env.DB)
    const sessionId = await createTestSession(env.KV, user.id)

    const mockResponse = { Items: [], pageCount: 0, hits: 0 }
    vi.stubGlobal('fetch', vi.fn(async () =>
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    ))

    const res = await api.request('/search/isbn/9784873119038', {
      headers: { Cookie: `session_id=${sessionId}` },
    }, env)

    expect(res.status).toBe(200)
    const body = await res.json() as { success: boolean; data: null }
    expect(body.success).toBe(true)
    expect(body.data).toBeNull()
  })
})
