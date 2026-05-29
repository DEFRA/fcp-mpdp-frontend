import { describe, test, expect } from 'vitest'
import { getRefererPath } from '../../../../src/common/utils/get-referer-path.js'

const hostname = 'localhost'

describe('getRefererPath', () => {
  test.each([
    [null],
    [undefined],
    [''],
    [42]
  ])('returns / when url is absent or invalid: %s', (url) => {
    expect(getRefererPath(url, hostname)).toBe('/')
  })

  test.each([
    ['/'],
    ['/search'],
    ['/search?q=test'],
    ['/a/deeply/nested/path']
  ])('returns the path for a relative url: %s', (url) => {
    expect(getRefererPath(url, hostname)).toBe(url)
  })

  test.each([
    ['http://localhost/', '/'],
    ['http://localhost/search', '/search'],
    ['http://localhost/search?q=test', '/search?q=test'],
    ['https://localhost/cookies', '/cookies']
  ])('extracts the path from a same-origin absolute url: %s → %s', (url, expected) => {
    expect(getRefererPath(url, hostname)).toBe(expected)
  })

  test.each([
    ['https://evil.com'],
    ['https://evil.com/steal'],
    ['http://evil.com/path'],
    ['//evil.com'],
    ['javascript:alert(1)']
  ])('returns / for an external or unsafe url: %s', (url) => {
    expect(getRefererPath(url, hostname)).toBe('/')
  })
})
