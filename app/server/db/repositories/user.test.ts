import { describe, it, expect, beforeEach } from 'vitest'
import { env } from 'cloudflare:test'
import * as userRepo from './user'
import { createTestUser, cleanupDatabase } from '../../../test/helpers'

describe('User Repository', () => {
  beforeEach(async () => {
    await cleanupDatabase(env.DB)
  })

  it('should find user by id', async () => {
    const user = await createTestUser(env.DB)

    const found = await userRepo.findById(env.DB, user.id)
    expect(found.id).toBe(user.id)
  })

  it('should throw when user id is missing', async () => {
    await expect(
      userRepo.findById(env.DB, 'missing-user-id')
    ).rejects.toThrow('User not found')
  })

  it('should find user by username', async () => {
    const user = await createTestUser(env.DB, { username: 'test_user' })

    const found = await userRepo.findByUsername(env.DB, 'test_user')
    expect(found.id).toBe(user.id)
  })

  it('should throw when username is missing', async () => {
    await expect(
      userRepo.findByUsername(env.DB, 'missing_user')
    ).rejects.toThrow('User not found')
  })

  it('should return null for missing email', async () => {
    const result = await userRepo.findByEmail(env.DB, 'missing@example.com')
    expect(result).toBeNull()
  })

  it('should return null for missing provider', async () => {
    const result = await userRepo.findByProvider(env.DB, 'github', 'missing')
    expect(result).toBeNull()
  })

  it('should report username availability', async () => {
    const user = await createTestUser(env.DB, { username: 'taken' })

    const taken = await userRepo.isUsernameTaken(env.DB, 'taken')
    const available = await userRepo.isUsernameTaken(env.DB, 'available')
    const excluded = await userRepo.isUsernameTaken(env.DB, 'taken', user.id)

    expect(taken).toBe(true)
    expect(available).toBe(false)
    expect(excluded).toBe(false)
  })

  it('should create a new user', async () => {
    const now = new Date().toISOString()
    const created = await userRepo.create(env.DB, {
      id: 'user-1',
      username: 'new_user',
      email: 'new_user@example.com',
      name: 'New User',
      bio: null,
      avatar_url: null,
      provider: 'github',
      provider_id: 'provider-1',
      created_at: now,
      updated_at: now,
    })

    expect(created.username).toBe('new_user')
    expect(created.email).toBe('new_user@example.com')
  })

  it('should reject duplicate usernames on create', async () => {
    await createTestUser(env.DB, { username: 'dupe' })
    const now = new Date().toISOString()

    await expect(
      userRepo.create(env.DB, {
        id: 'user-2',
        username: 'dupe',
        email: 'dupe@example.com',
        name: 'Dupe',
        bio: null,
        avatar_url: null,
        provider: 'github',
        provider_id: 'provider-2',
        created_at: now,
        updated_at: now,
      })
    ).rejects.toThrow('Username already taken')
  })

  it('should update user fields', async () => {
    const user = await createTestUser(env.DB, { username: 'before' })

    const updated = await userRepo.update(env.DB, user.id, {
      username: 'after',
      name: 'After Name',
    })

    expect(updated.username).toBe('after')
    expect(updated.name).toBe('After Name')
  })

  it('should reject duplicate usernames on update', async () => {
    await createTestUser(env.DB, { username: 'existing' })
    const user = await createTestUser(env.DB, { username: 'change_me' })

    await expect(
      userRepo.update(env.DB, user.id, { username: 'existing' })
    ).rejects.toThrow('Username already taken')
  })

  it('should delete user by id', async () => {
    const user = await createTestUser(env.DB)

    await userRepo.deleteById(env.DB, user.id)

    await expect(
      userRepo.findById(env.DB, user.id)
    ).rejects.toThrow('User not found')
  })
})
