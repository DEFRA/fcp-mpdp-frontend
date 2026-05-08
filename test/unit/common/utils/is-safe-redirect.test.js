import { describe, test, expect } from 'vitest'
import { isSafeRedirect } from '../../../../src/common/utils/is-safe-redirect.js'

describe('isSafeRedirect', () => {
  test.each([
    ['/'],
    ['/search'],
    ['/search?payee=smith'],
    ['/cookies?success=true'],
    ['/a/deeply/nested/path']
  ])('returns true for safe relative URL: %s', (url) => {
    expect(isSafeRedirect(url)).toBe(true)
  })

  test.each([
    ['https://evil.com'],
    ['http://evil.com'],
    ['//evil.com'],
    ['//evil.com/path'],
    [''],
    [null],
    [undefined],
    [42],
    [{}]
  ])('returns false for unsafe or invalid value: %s', (url) => {
    expect(isSafeRedirect(url)).toBe(false)
  })
})
