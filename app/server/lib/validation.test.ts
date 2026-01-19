import { describe, it, expect } from 'vitest'
import { isValidUUID, isValidISBN, isValidEmail, isValidUrl } from './validation'

describe('isValidUUID', () => {
  it('should return true for valid UUID v4', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true)
  })

  it('should return false for invalid UUID', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false)
    expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false)
    expect(isValidUUID('')).toBe(false)
    expect(isValidUUID('550e8400e29b41d4a716446655440000')).toBe(false)
  })
})

describe('isValidISBN', () => {
  it('should return true for valid ISBN-10', () => {
    expect(isValidISBN('0123456789')).toBe(true)
    expect(isValidISBN('012345678X')).toBe(true)
  })

  it('should return true for valid ISBN-13', () => {
    expect(isValidISBN('9780123456789')).toBe(true)
    expect(isValidISBN('9784873119038')).toBe(true)
  })

  it('should return false for invalid ISBN', () => {
    expect(isValidISBN('123')).toBe(false)
    expect(isValidISBN('not-an-isbn')).toBe(false)
    expect(isValidISBN('')).toBe(false)
    expect(isValidISBN('978012345678')).toBe(false)
  })
})

describe('isValidEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.co.jp')).toBe(true)
    expect(isValidEmail('user+tag@example.org')).toBe(true)
  })

  it('should return false for invalid email addresses', () => {
    expect(isValidEmail('not-an-email')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('user@')).toBe(false)
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('user name@example.com')).toBe(false)
  })
})

describe('isValidUrl', () => {
  it('should return true for valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
    expect(isValidUrl('http://localhost:3000')).toBe(true)
    expect(isValidUrl('https://example.com/path?query=1')).toBe(true)
  })

  it('should return false for invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false)
    expect(isValidUrl('')).toBe(false)
    expect(isValidUrl('example.com')).toBe(false)
  })
})
