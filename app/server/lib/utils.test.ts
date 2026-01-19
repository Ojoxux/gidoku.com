import { describe, it, expect } from 'vitest'
import {
  generateRandomString,
  removeUndefined,
  chunk,
  toISOString,
  snakeToCamel,
  camelToSnake,
  keysToCamel,
  keysToSnake,
  truncate,
} from './utils'

describe('generateRandomString', () => {
  it('should generate string of specified length', () => {
    expect(generateRandomString(16)).toHaveLength(16)
    expect(generateRandomString(32)).toHaveLength(32)
    expect(generateRandomString(64)).toHaveLength(64)
  })

  it('should generate different strings each time', () => {
    const str1 = generateRandomString(32)
    const str2 = generateRandomString(32)
    expect(str1).not.toBe(str2)
  })

  it('should only contain alphanumeric characters', () => {
    const str = generateRandomString(100)
    expect(str).toMatch(/^[A-Za-z0-9]+$/)
  })
})

describe('removeUndefined', () => {
  it('should remove undefined properties', () => {
    const obj = { a: 1, b: undefined, c: 'test' }
    expect(removeUndefined(obj)).toEqual({ a: 1, c: 'test' })
  })

  it('should keep null and empty string', () => {
    const obj = { a: null, b: '', c: 0 }
    expect(removeUndefined(obj)).toEqual({ a: null, b: '', c: 0 })
  })

  it('should return empty object for all undefined', () => {
    const obj = { a: undefined, b: undefined }
    expect(removeUndefined(obj)).toEqual({})
  })
})

describe('chunk', () => {
  it('should split array into chunks of specified size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]])
  })

  it('should return single chunk if size is larger than array', () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]])
  })

  it('should return empty array for empty input', () => {
    expect(chunk([], 2)).toEqual([])
  })
})

describe('toISOString', () => {
  it('should convert date to ISO string', () => {
    const date = new Date('2024-01-15T10:30:00Z')
    expect(toISOString(date)).toBe('2024-01-15T10:30:00.000Z')
  })

  it('should use current date if no argument', () => {
    const result = toISOString()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
  })
})

describe('snakeToCamel', () => {
  it('should convert snake_case to camelCase', () => {
    expect(snakeToCamel('hello_world')).toBe('helloWorld')
    expect(snakeToCamel('user_profile_image')).toBe('userProfileImage')
    expect(snakeToCamel('id')).toBe('id')
  })
})

describe('camelToSnake', () => {
  it('should convert camelCase to snake_case', () => {
    expect(camelToSnake('helloWorld')).toBe('hello_world')
    expect(camelToSnake('userProfileImage')).toBe('user_profile_image')
    expect(camelToSnake('id')).toBe('id')
  })
})

describe('keysToCamel', () => {
  it('should convert object keys to camelCase', () => {
    const obj = { user_name: 'test', created_at: '2024-01-01' }
    expect(keysToCamel(obj)).toEqual({ userName: 'test', createdAt: '2024-01-01' })
  })
})

describe('keysToSnake', () => {
  it('should convert object keys to snake_case', () => {
    const obj = { userName: 'test', createdAt: '2024-01-01' }
    expect(keysToSnake(obj)).toEqual({ user_name: 'test', created_at: '2024-01-01' })
  })
})

describe('truncate', () => {
  it('should truncate string longer than maxLength', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...')
  })

  it('should not truncate string shorter than or equal to maxLength', () => {
    expect(truncate('Hello', 10)).toBe('Hello')
    expect(truncate('Hello', 5)).toBe('Hello')
  })
})
