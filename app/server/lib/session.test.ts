import { describe, it, expect } from 'vitest'
import { env } from 'cloudflare:test'
import {
  createSession,
  getSession,
  validateSession,
  deleteSession,
  refreshSession,
  deleteAllUserSessions,
  regenerateSession,
} from './session'

describe('Session helpers', () => {
  it('should create and get a session', async () => {
    const sessionId = await createSession(env.KV, 'user-1')
    const userId = await getSession(env.KV, sessionId)
    expect(userId).toBe('user-1')
  })

  it('should validate existing session', async () => {
    const sessionId = await createSession(env.KV, 'user-2')
    const userId = await validateSession(env.KV, sessionId)
    expect(userId).toBe('user-2')
  })

  it('should throw on missing session', async () => {
    await expect(validateSession(env.KV, 'missing')).rejects.toThrow(
      'Invalid or expired session'
    )
  })

  it('should delete a session', async () => {
    const sessionId = await createSession(env.KV, 'user-3')
    await deleteSession(env.KV, sessionId)
    const userId = await getSession(env.KV, sessionId)
    expect(userId).toBeNull()
  })

  it('should refresh an existing session', async () => {
    const sessionId = await createSession(env.KV, 'user-4', 60)
    await refreshSession(env.KV, sessionId, 60)
    const userId = await getSession(env.KV, sessionId)
    expect(userId).toBe('user-4')
  })

  it('should throw when refreshing missing session', async () => {
    await expect(refreshSession(env.KV, 'missing')).rejects.toThrow(
      'Session not found'
    )
  })

  it('should regenerate session and remove old session', async () => {
    const oldSessionId = await createSession(env.KV, 'user-5')
    const newSessionId = await regenerateSession(env.KV, oldSessionId, 'user-5')

    expect(newSessionId).not.toBe(oldSessionId)
    expect(await getSession(env.KV, oldSessionId)).toBeNull()
    expect(await getSession(env.KV, newSessionId)).toBe('user-5')
  })

  it('should delete all user sessions', async () => {
    const sessionA = await createSession(env.KV, 'user-6')
    const sessionB = await createSession(env.KV, 'user-6')

    await deleteAllUserSessions(env.KV, [sessionA, sessionB])

    expect(await getSession(env.KV, sessionA)).toBeNull()
    expect(await getSession(env.KV, sessionB)).toBeNull()
  })
})
