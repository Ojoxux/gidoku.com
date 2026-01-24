import { describe, it, expect, beforeEach } from 'vitest'
import { env } from 'cloudflare:test'
import api from './index'
import { createTestBook, createTestSession, createTestUser, cleanupDatabase } from '../../test/helpers'

describe('Users API Integration', () => {
  beforeEach(async () => {
    await cleanupDatabase(env.DB)
  })

  it('should return 401 for /users/me without session', async () => {
    const res = await api.request('/users/me', {}, env)
    expect(res.status).toBe(401)
  })

  it('should return current user info', async () => {
    const user = await createTestUser(env.DB)
    const sessionId = await createTestSession(env.KV, user.id)

    const res = await api.request('/users/me', {
      headers: { Cookie: `session_id=${sessionId}` },
    }, env)

    expect(res.status).toBe(200)
    const body = await res.json() as { success: boolean; data: { id: string; username: string } }
    expect(body.success).toBe(true)
    expect(body.data.id).toBe(user.id)
    expect(body.data.username).toBe(user.username)
  })

  it('should reject reserved username update', async () => {
    const user = await createTestUser(env.DB)
    const sessionId = await createTestSession(env.KV, user.id)

    const res = await api.request('/users/me', {
      method: 'PUT',
      headers: {
        Cookie: `session_id=${sessionId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'admin' }),
    }, env)

    expect(res.status).toBe(400)
    const body = await res.json() as { error?: string }
    expect(body.error).toBe('このユーザー名は使用できません')
  })

  it('should update user profile fields', async () => {
    const user = await createTestUser(env.DB)
    const sessionId = await createTestSession(env.KV, user.id)

    const res = await api.request('/users/me', {
      method: 'PUT',
      headers: {
        Cookie: `session_id=${sessionId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Updated Name',
        bio: 'Updated bio',
        avatarUrl: 'https://example.com/avatar.png',
      }),
    }, env)

    expect(res.status).toBe(200)
    const body = await res.json() as { success: boolean; data: { name: string; bio: string; avatarUrl: string } }
    expect(body.data.name).toBe('Updated Name')
    expect(body.data.bio).toBe('Updated bio')
    expect(body.data.avatarUrl).toBe('https://example.com/avatar.png')
  })

  it('should return unavailable for reserved username check', async () => {
    const res = await api.request('/users/check/admin', {}, env)
    expect(res.status).toBe(200)
    const body = await res.json() as { success: boolean; data: { available: boolean; reason?: string } }
    expect(body.data.available).toBe(false)
    expect(body.data.reason).toBe('reserved')
  })

  it('should return unavailable for taken username', async () => {
    const user = await createTestUser(env.DB)

    const res = await api.request(`/users/check/${user.username}`, {}, env)
    expect(res.status).toBe(200)
    const body = await res.json() as { success: boolean; data: { available: boolean } }
    expect(body.data.available).toBe(false)
  })

  it('should return public profile without private fields', async () => {
    const user = await createTestUser(env.DB)

    const res = await api.request(`/users/${user.username}`, {}, env)
    expect(res.status).toBe(200)
    const body = await res.json() as { success: boolean; data: Record<string, unknown> }
    expect(body.data.username).toBe(user.username)
    expect('email' in body.data).toBe(false)
    expect('provider' in body.data).toBe(false)
  })

  it('should return only completed books for public profile', async () => {
    const user = await createTestUser(env.DB)
    await createTestBook(env.DB, user.id, { status: 'completed' })
    await createTestBook(env.DB, user.id, { status: 'reading' })

    const res = await api.request(`/users/${user.username}/books`, {}, env)
    expect(res.status).toBe(200)
    const body = await res.json() as { success: boolean; data: Array<{ status: string; memo: string | null }> }
    expect(body.data).toHaveLength(1)
    expect(body.data[0].status).toBe('completed')
    expect(body.data[0].memo).toBeNull()
  })

  it('should delete user account', async () => {
    const user = await createTestUser(env.DB)
    const sessionId = await createTestSession(env.KV, user.id)

    const res = await api.request('/users/me', {
      method: 'DELETE',
      headers: { Cookie: `session_id=${sessionId}` },
    }, env)

    expect(res.status).toBe(200)
    const result = await env.DB.prepare('SELECT id FROM users WHERE id = ?')
      .bind(user.id)
      .first()
    expect(result).toBeNull()
  })
})
