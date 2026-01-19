import { describe, it, expect } from 'vitest'
import {
  calculateStatus,
  calculateProgress,
  validatePageProgress,
  isCompleted,
  isReading,
  shouldSetFinishedAt,
} from './book'

describe('calculateStatus', () => {
  it('should return "unread" when currentPage is 0', () => {
    expect(calculateStatus(0, 100)).toBe('unread')
    expect(calculateStatus(0, 0)).toBe('unread')
  })

  it('should return "completed" when currentPage >= pageCount', () => {
    expect(calculateStatus(100, 100)).toBe('completed')
    expect(calculateStatus(150, 100)).toBe('completed')
  })

  it('should return "reading" when in progress', () => {
    expect(calculateStatus(50, 100)).toBe('reading')
    expect(calculateStatus(1, 100)).toBe('reading')
    expect(calculateStatus(99, 100)).toBe('reading')
  })

  it('should return "reading" when pageCount is 0 but currentPage > 0', () => {
    expect(calculateStatus(50, 0)).toBe('reading')
  })
})

describe('calculateProgress', () => {
  it('should return 0 when pageCount is 0', () => {
    expect(calculateProgress(50, 0)).toBe(0)
    expect(calculateProgress(0, 0)).toBe(0)
  })

  it('should calculate progress percentage correctly', () => {
    expect(calculateProgress(50, 100)).toBe(50)
    expect(calculateProgress(25, 100)).toBe(25)
    expect(calculateProgress(1, 3)).toBe(33)
  })

  it('should cap at 100%', () => {
    expect(calculateProgress(150, 100)).toBe(100)
    expect(calculateProgress(100, 100)).toBe(100)
  })

  it('should return 0 when currentPage is 0', () => {
    expect(calculateProgress(0, 100)).toBe(0)
  })
})

describe('validatePageProgress', () => {
  it('should return valid for normal progress', () => {
    expect(validatePageProgress(50, 100)).toEqual({ valid: true })
    expect(validatePageProgress(0, 100)).toEqual({ valid: true })
    expect(validatePageProgress(100, 100)).toEqual({ valid: true })
  })

  it('should return invalid for negative currentPage', () => {
    const result = validatePageProgress(-1, 100)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Current page cannot be negative')
  })

  it('should return invalid when currentPage exceeds pageCount', () => {
    const result = validatePageProgress(150, 100)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Current page exceeds total pages')
  })

  it('should allow any currentPage when pageCount is 0', () => {
    expect(validatePageProgress(50, 0)).toEqual({ valid: true })
  })
})

describe('isCompleted', () => {
  it('should return true for completed status', () => {
    expect(isCompleted('completed')).toBe(true)
  })

  it('should return false for other statuses', () => {
    expect(isCompleted('unread')).toBe(false)
    expect(isCompleted('reading')).toBe(false)
  })
})

describe('isReading', () => {
  it('should return true for reading status', () => {
    expect(isReading('reading')).toBe(true)
  })

  it('should return false for other statuses', () => {
    expect(isReading('unread')).toBe(false)
    expect(isReading('completed')).toBe(false)
  })
})

describe('shouldSetFinishedAt', () => {
  it('should return true when transitioning to completed', () => {
    expect(shouldSetFinishedAt('completed', 'reading')).toBe(true)
    expect(shouldSetFinishedAt('completed', 'unread')).toBe(true)
  })

  it('should return false when already completed', () => {
    expect(shouldSetFinishedAt('completed', 'completed')).toBe(false)
  })

  it('should return false when not transitioning to completed', () => {
    expect(shouldSetFinishedAt('reading', 'unread')).toBe(false)
    expect(shouldSetFinishedAt('unread', 'reading')).toBe(false)
  })
})
