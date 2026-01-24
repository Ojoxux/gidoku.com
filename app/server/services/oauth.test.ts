import { describe, it, expect, vi, afterEach } from 'vitest'
import type { Env } from '../../types/env'
import { ExternalApiError } from '../lib/errors'
import { getAuthUrl, getAccessToken, getUser } from './oauth'

const testEnv = {
  APP_URL: 'https://example.com',
  GITHUB_CLIENT_ID: 'github-id',
  GITHUB_CLIENT_SECRET: 'github-secret',
  GOOGLE_CLIENT_ID: 'google-id',
  GOOGLE_CLIENT_SECRET: 'google-secret',
} as Env

describe('oauth service', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should build github auth url', () => {
    const url = getAuthUrl('github', 'state123', testEnv)
    const parsed = new URL(url)
    expect(parsed.host).toBe('github.com')
    expect(parsed.searchParams.get('client_id')).toBe('github-id')
    expect(parsed.searchParams.get('state')).toBe('state123')
    expect(parsed.searchParams.get('redirect_uri')).toBe(
      'https://example.com/api/auth/github/callback'
    )
  })

  it('should build google auth url', () => {
    const url = getAuthUrl('google', 'state456', testEnv)
    const parsed = new URL(url)
    expect(parsed.host).toBe('accounts.google.com')
    expect(parsed.searchParams.get('client_id')).toBe('google-id')
    expect(parsed.searchParams.get('state')).toBe('state456')
    expect(parsed.searchParams.get('redirect_uri')).toBe(
      'https://example.com/api/auth/google/callback'
    )
  })

  it('should return github access token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ access_token: 'token-123' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )

    const token = await getAccessToken('github', 'code', testEnv)
    expect(token).toBe('token-123')
  })

  it('should throw when github token response is invalid', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ error: 'bad' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )

    await expect(getAccessToken('github', 'code', testEnv)).rejects.toBeInstanceOf(
      ExternalApiError
    )
  })

  it('should return github user when email is present', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            id: 1,
            login: 'octo',
            name: 'Octo',
            email: 'octo@example.com',
            avatar_url: 'https://example.com/a.png',
            bio: null,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      )
    )

    const user = await getUser('github', 'token')
    expect(user.email).toBe('octo@example.com')
    expect(user.provider).toBe('github')
    expect(user.username).toBe('octo')
  })
})
