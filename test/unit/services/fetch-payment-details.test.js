import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest'
import { config } from '../../../src/config/config.js'
import { getUrlParams } from '../../../src/api/get-url-params.js'
import { fetchPaymentDetails } from '../../../src/services/fetch-payment-details.js'
import * as apiGet from '../../../src/api/get.js'

vi.mock('../../../src/api/get.js')
vi.mock('../../../src/api/get-backend-auth-headers.js', () => ({
  getBackendAuthHeaders: vi.fn().mockReturnValue({})
}))

const endpoint = 'https://__TEST_ENDPOINT__'
process.env.MPDP_BACKEND_ENDPOINT = endpoint
const path = process.env.MPDP_BACKEND_PATH

describe('fetchPaymentDetails', () => {
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
  const mockData = [{
    payee_name: 'T R Carter & Sons 1',
    part_postcode: 'RG1',
    town: 'Reading',
    county_council: 'Berkshire',
    amount: '11142000.95'
  }]

  test('fetchPaymentDetails returns results', async () => {
    apiGet.get.mockResolvedValue({ payload: JSON.stringify(mockData) })

    const payeeName = '__PAYEE_NAME__'
    const partPostcode = '__POST_CODE'
    const response = await fetchPaymentDetails(payeeName, partPostcode)

    expect(response).toMatchObject(mockData)

    const newRoute = getUrlParams(`${payeeName}/${partPostcode}`)
    expect(apiGet.get).toHaveBeenCalledWith(newRoute)
  })
})
