import { describe, test, expect } from 'vitest'
import { getSafeRedirect } from '../../../../src/common/utils/get-safe-redirect.js'

describe('getSafeRedirect', () => {
  test.each([
    ['/'],
    ['/search'],
    ['/search?payee=smith'],
    ['/cookies?success=true'],
    ['/a/deeply/nested/path']
  ])('returns the URL for a safe relative path: %s', (url) => {
    expect(getSafeRedirect(url)).toBe(url)
  })

  test.each([
    ['https://evil.com'],
    ['http://evil.com'],
    ['//evil.com'],
    ['//evil.com/path'],
    ['javascript:alert(1)'],
    [''],
    [null],
    [undefined],
    [42],
    [{}]
  ])('returns empty string for unsafe or invalid value: %s', (url) => {
    expect(getSafeRedirect(url)).toBe('')
  })
})
