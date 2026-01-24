import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { env } from 'cloudflare:test'
import { authMiddleware, optionalAuthMiddleware, invalidateUserCache } from './auth'
import { createTestSession, createTestUser, cleanupDatabase } from '../../test/helpers'
import type { HonoContext } from '../../types/env'

describe('Auth middleware', () => {
  beforeEach(async () => {
    await cleanupDatabase(env.DB)
  })

  it('should return 401 without session cookie', async () => {
    const app = new Hono<HonoContext>()
    app.use('*', authMiddleware)
    app.get('/protected', (c) => c.json({ ok: true }))

    const res = await app.request('/protected', {}, env)
    expect(res.status).toBe(401)
  })

  it('should set user info for valid session', async () => {
    const user = await createTestUser(env.DB)
    const sessionId = await createTestSession(env.KV, user.id)

    const app = new Hono<HonoContext>()
    app.use('*', authMiddleware)
    app.get('/protected', (c) =>
      c.json({ userId: c.get('userId'), user: c.get('user') })
    )

    const res = await app.request(
      '/protected',
      { headers: { Cookie: `session_id=${sessionId}` } },
      env
    )

    expect(res.status).toBe(200)
    const body = await res.json() as { userId: string; user: { id: string } }
    expect(body.userId).toBe(user.id)
    expect(body.user.id).toBe(user.id)

    const cached = await env.KV.get(`user_cache:${user.id}`)
    expect(cached).toBeTruthy()
  })

  it('should allow optional auth without session', async () => {
    const app = new Hono<HonoContext>()
    app.use('*', optionalAuthMiddleware)
    app.get('/optional', (c) => c.json({ userId: c.get('userId') ?? null }))

    const res = await app.request('/optional', {}, env)
    expect(res.status).toBe(200)
    const body = await res.json() as { userId: string | null }
    expect(body.userId).toBeNull()
  })

  it('should ignore invalid session in optional auth', async () => {
    const app = new Hono<HonoContext>()
    app.use('*', optionalAuthMiddleware)
    app.get('/optional', (c) => c.json({ userId: c.get('userId') ?? null }))

    const res = await app.request(
      '/optional',
      { headers: { Cookie: 'session_id=missing' } },
      env
    )
    expect(res.status).toBe(200)
  })

  it('should invalidate cached user', async () => {
    await env.KV.put('user_cache:user-1', JSON.stringify({ id: 'user-1' }))
    await invalidateUserCache(env.KV, 'user-1')
    const cached = await env.KV.get('user_cache:user-1')
    expect(cached).toBeNull()
  })
})
