import { describe, it, expect, beforeEach } from 'vitest'
import { env } from 'cloudflare:test'
import api from './index'
import { createTestSession, createTestUser, cleanupDatabase } from '../../test/helpers'

describe('Auth API Integration', () => {
  beforeEach(async () => {
    await cleanupDatabase(env.DB)
  })

  it('should redirect and store oauth state', async () => {
    const res = await api.request('/auth/github', {}, env)

    expect([302, 307]).toContain(res.status)
    const location = res.headers.get('Location')
    expect(location).toBeTruthy()
    if (!location) {
      throw new Error('Missing redirect location')
    }

    const url = new URL(location)
    const state = url.searchParams.get('state')
    expect(state).toBeTruthy()

    const storedProvider = await env.KV.get(`oauth_state:${state}`)
    expect(storedProvider).toBe('github')
  })

  it('should return 400 for invalid provider', async () => {
    const res = await api.request('/auth/invalid', {}, env)
    expect(res.status).toBe(400)
  })

  it('should reject callback with invalid state', async () => {
    const state = 'state_mismatch'
    await env.KV.put(`oauth_state:${state}`, 'github')

    const res = await api.request(`/auth/google/callback?code=123&state=${state}`, {}, env)
    expect(res.status).toBe(400)
    const body = await res.json() as { success: boolean; error: { code: string } }
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('INVALID_STATE')
  })

  it('should return session info for authenticated user', async () => {
    const user = await createTestUser(env.DB)
    const sessionId = await createTestSession(env.KV, user.id)

    const res = await api.request('/auth/session', {
      headers: { Cookie: `session_id=${sessionId}` },
    }, env)

    expect(res.status).toBe(200)
    const body = await res.json() as { success: boolean; data: { authenticated: boolean; user: { id: string } } }
    expect(body.success).toBe(true)
    expect(body.data.authenticated).toBe(true)
    expect(body.data.user.id).toBe(user.id)
  })

  it('should delete session on logout', async () => {
    const user = await createTestUser(env.DB)
    const sessionId = await createTestSession(env.KV, user.id)

    const res = await api.request('/auth/logout', {
      method: 'POST',
      headers: { Cookie: `session_id=${sessionId}` },
    }, env)

    expect(res.status).toBe(200)
    const session = await env.KV.get(`session:${sessionId}`)
    expect(session).toBeNull()
  })

  it('should return 401 when accessing session without cookie', async () => {
    const res = await api.request('/auth/session', {}, env)
    expect(res.status).toBe(401)
  })
})
