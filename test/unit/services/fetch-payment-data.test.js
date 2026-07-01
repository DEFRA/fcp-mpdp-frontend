import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest'
import { fetchPaymentData } from '../../../src/services/fetch-payment-data.js'
import * as apiPost from '../../../src/api/post.js'
import { config } from '../../../src/config/config.js'

vi.mock('../../../src/api/post.js')
vi.mock('../../../src/api/get-backend-auth-headers.js', () => ({
  getBackendAuthHeaders: vi.fn().mockReturnValue({})
}))

const endpoint = 'https://__TEST_ENDPOINT__'
process.env.MPDP_BACKEND_ENDPOINT = endpoint
const path = process.env.MPDP_BACKEND_PATH

describe('fetchPaymentData', () => {
  const mockData = [{
    payee_name: 'T R Carter & Sons 1',
    part_postcode: 'RG1',
    town: 'Reading',
    county_council: 'Berkshire',
    amount: '11142000.95'
  }]

  beforeEach(() => {
    config.load({})
    config.validate({ allowed: 'strict' })

    vi.spyOn(config, 'get').mockImplementation(key => {
      if (key === 'backend.endpoint') { return endpoint }
      if (key === 'backend.path') { return path }
      if (key === 'search.limit') { return 20 }
      return config[key]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('fetchPaymentData return empty results list if no response is received', async () => {
    apiPost.post.mockRejectedValue(Object.assign(new Error('Not Found'), { status: 404 }))

    const searchString = '__TEST_STRING__'
    const offset = 0
    const sortBy = 'score'
    const filterBy = { schemes: [] }

    await expect(fetchPaymentData(searchString, offset, filterBy, sortBy)).rejects.toThrow()
  })

  test('getPaymentData returns results from the payload in the right format', async () => {
    apiPost.post.mockResolvedValue({
      rows: mockData,
      count: 1,
      filterOptions: {}
    })

    const searchString = '__TEST_STRING__'
    const offset = 0
    const filterBy = { schemes: [] }
    const sortBy = 'score'
    const res = await fetchPaymentData(searchString, offset, filterBy, sortBy)

    expect(res).toMatchObject({
      results: mockData,
      total: mockData.length,
      filterOptions: {}
    })

    expect(apiPost.post).toHaveBeenCalledWith('', { filterBy, limit: 20, offset, searchString, sortBy, action: undefined })
  })

  test('getPaymentData called with download action', async () => {
    apiPost.post.mockResolvedValue({
      rows: mockData,
      count: 1
    })

    const searchString = '__TEST_STRING__'
    const offset = 0
    const filterBy = { schemes: [] }
    const sortBy = 'score'
    const action = 'download'
    const res = await fetchPaymentData(searchString, offset, filterBy, sortBy, action)

    expect(res).toMatchObject({
      results: mockData,
      total: mockData.length
    })

    expect(apiPost.post).toHaveBeenCalledWith('', { filterBy, limit: 20, offset, searchString, sortBy, action })
  })
})
