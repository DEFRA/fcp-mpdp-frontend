import { describe, afterEach, beforeEach, test, expect, vi } from 'vitest'
import { fetchSearchSuggestions } from '../../../src/services/fetch-search-suggestions.js'
import { getUrlParams } from '../../../src/api/get-url-params.js'
import { config } from '../../../src/config/config.js'
import mockSuggestions from '../../data/mock-suggestions.js'
import * as apiGet from '../../../src/api/get.js'

vi.mock('../../../src/api/get.js')
vi.mock('../../../src/api/get-backend-auth-headers.js', () => ({
  getBackendAuthHeaders: vi.fn().mockReturnValue({})
}))

const endpoint = 'https://__TEST_ENDPOINT__'
process.env.MPDP_BACKEND_ENDPOINT = endpoint
const path = process.env.MPDP_BACKEND_PATH

describe('fetchSearchSuggestions', () => {
  beforeEach(() => {
    config.load({})
    config.validate({ allowed: 'strict' })

    vi.spyOn(config, 'get').mockImplementation(key => {
      if (key === 'backend.endpoint') { return endpoint }
      if (key === 'backend.path') { return path }
      return config[key]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('should return default object if no response is received', async () => {
    apiGet.get.mockRejectedValue(Object.assign(new Error('Not Found'), { status: 404 }))

    const searchString = '__PAYEE_NAME__'
    const res = await fetchSearchSuggestions(searchString)

    expect(res).toEqual({ rows: [], count: 0 })

    const newRoute = getUrlParams('search', { searchString })
    expect(apiGet.get).toHaveBeenCalledWith(newRoute)
  })

  test('should return results', async () => {
    apiGet.get.mockResolvedValue(mockSuggestions)

    const searchString = '__TEST_STRING__'
    const res = await fetchSearchSuggestions(searchString)

    expect(res).toMatchObject(mockSuggestions)

    const newRoute = getUrlParams('search', { searchString })
    expect(apiGet.get).toHaveBeenCalledWith(newRoute)
  })

  test('should return empty results when backend returns 404', async () => {
    apiGet.get.mockRejectedValue(Object.assign(new Error('Not Found'), { status: 404 }))

    const res = await fetchSearchSuggestions('__NO_RESULTS__')

    expect(res).toEqual({ rows: [], count: 0 })
  })

  test('should rethrow non-404 errors', async () => {
    apiGet.get.mockRejectedValue(new Error('Internal Server Error'))

    await expect(fetchSearchSuggestions('__ERROR__')).rejects.toThrow('Internal Server Error')
  })
})
