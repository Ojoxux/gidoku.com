import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Hono } from 'hono'
import { env } from 'cloudflare:test'
import { rateLimiter } from './rate-limit'
import { errorHandler } from './errors'

describe('rateLimiter middleware', () => {
  const errorSpy = vi.spyOn(console, 'error')

  beforeEach(() => {
    errorSpy.mockImplementation(() => {})
  })

  afterEach(() => {
    errorSpy.mockReset()
  })

  it('should enforce limits per window', async () => {
    const app = new Hono()
    app.onError(errorHandler)
    app.use(
      '*',
      rateLimiter({
        windowSec: 60,
        limit: 1,
        keyPrefix: 'test',
      })
    )
    app.get('/limited', (c) => c.json({ ok: true }))

    const first = await app.request(
      '/limited',
      { headers: { 'CF-Connecting-IP': '1.1.1.1' } },
      env
    )
    expect(first.status).toBe(200)
    expect(first.headers.get('X-RateLimit-Limit')).toBe('1')
    expect(first.headers.get('X-RateLimit-Remaining')).toBe('0')

    const second = await app.request(
      '/limited',
      { headers: { 'CF-Connecting-IP': '1.1.1.1' } },
      env
    )
    expect(second.status).toBe(429)
    expect(second.headers.get('Retry-After')).toBeTruthy()
    expect(errorSpy).toHaveBeenCalled()
  })
})
