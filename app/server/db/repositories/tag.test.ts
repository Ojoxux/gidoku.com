import { describe, it, expect, beforeEach } from 'vitest'
import { env } from 'cloudflare:test'
import * as tagRepo from './tag'
import { createTestTag, createTestUser, cleanupDatabase } from '../../../test/helpers'

describe('Tag Repository', () => {
  let userId: string

  beforeEach(async () => {
    await cleanupDatabase(env.DB)
    const user = await createTestUser(env.DB)
    userId = user.id
  })

  it('should return tags for a user', async () => {
    await createTestTag(env.DB, userId, 'Alpha')
    await createTestTag(env.DB, userId, 'Beta')

    const tags = await tagRepo.findByUserId(env.DB, userId)
    expect(tags).toHaveLength(2)
  })

  it('should find tag by id', async () => {
    const tag = await createTestTag(env.DB, userId, 'FindMe')

    const found = await tagRepo.findById(env.DB, tag.id, userId)
    expect(found.id).toBe(tag.id)
  })

  it('should throw when tag not found', async () => {
    await expect(
      tagRepo.findById(env.DB, 'missing-tag', userId)
    ).rejects.toThrow('Tag not found')
  })

  it('should find tag by name', async () => {
    const tag = await createTestTag(env.DB, userId, 'React')

    const found = await tagRepo.findByName(env.DB, 'React', userId)
    expect(found?.id).toBe(tag.id)
  })

  it('should return null when name not found', async () => {
    const found = await tagRepo.findByName(env.DB, 'Missing', userId)
    expect(found).toBeNull()
  })

  it('should create a tag', async () => {
    const created = await tagRepo.create(env.DB, {
      id: 'tag-1',
      userId,
      name: 'NewTag',
      createdAt: new Date().toISOString(),
    })

    expect(created.name).toBe('NewTag')
  })

  it('should reject duplicate tag names', async () => {
    await createTestTag(env.DB, userId, 'Duplicate')

    await expect(
      tagRepo.create(env.DB, {
        id: 'tag-2',
        userId,
        name: 'Duplicate',
        createdAt: new Date().toISOString(),
      })
    ).rejects.toThrow('Tag with this name already exists')
  })

  it('should update a tag name', async () => {
    const tag = await createTestTag(env.DB, userId, 'OldName')

    const updated = await tagRepo.update(env.DB, tag.id, userId, 'NewName')
    expect(updated.name).toBe('NewName')
  })

  it('should reject duplicate tag names on update', async () => {
    const tagA = await createTestTag(env.DB, userId, 'TagA')
    const tagB = await createTestTag(env.DB, userId, 'TagB')

    await expect(
      tagRepo.update(env.DB, tagB.id, userId, tagA.name)
    ).rejects.toThrow('Tag with this name already exists')
  })

  it('should delete tag by id', async () => {
    const tag = await createTestTag(env.DB, userId, 'DeleteMe')

    await tagRepo.deleteById(env.DB, tag.id, userId)

    await expect(
      tagRepo.findById(env.DB, tag.id, userId)
    ).rejects.toThrow('Tag not found')
  })

  it('should verify tag ownership', async () => {
    const tag = await createTestTag(env.DB, userId, 'Owned')
    const otherUser = await createTestUser(env.DB)

    const owned = await tagRepo.belongsToUser(env.DB, tag.id, userId)
    const notOwned = await tagRepo.belongsToUser(env.DB, tag.id, otherUser.id)

    expect(owned).toBe(true)
    expect(notOwned).toBe(false)
  })
})
