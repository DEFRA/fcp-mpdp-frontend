import { describe, test, expect, vi, beforeEach } from 'vitest'
import { fetchSchemePaymentsByYear } from '../../../src/services/fetch-scheme-payments-by-year.js'
import { getUrlParams } from '../../../src/api/get-url-params.js'
import { get } from '../../../src/api/get.js'

vi.mock('../../../src/api/get-url-params.js', () => ({
  getUrlParams: vi.fn()
}))

vi.mock('../../../src/api/get.js', () => ({
  get: vi.fn()
}))

describe('fetchSchemePaymentsByYear', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should call getUrlParams with "summary" and return parsed payload', async () => {
    const mockData = { year: 2023, amount: 1000 }
    getUrlParams.mockReturnValue('/test/url')
    get.mockResolvedValue(mockData)

    const result = await fetchSchemePaymentsByYear()

    expect(getUrlParams).toHaveBeenCalledWith('summary')
    expect(get).toHaveBeenCalledWith('/test/url')
    expect(result).toEqual(mockData)
  })

  test('should throw if get rejects', async () => {
    getUrlParams.mockReturnValue('/test/url')
    get.mockRejectedValue(new Error('Backend error'))

    await expect(fetchSchemePaymentsByYear()).rejects.toThrow('Backend error')
  })
})
