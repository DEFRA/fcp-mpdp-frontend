import { vi, describe, beforeEach, afterEach, test, expect } from 'vitest'
import Wreck from '@hapi/wreck'
import { config } from '../../../src/config/config.js'
import { get } from '../../../src/api/get.js'

const endpoint = 'https://__TEST_ENDPOINT__'
process.env.MPDP_BACKEND_ENDPOINT = endpoint
const path = process.env.MPDP_BACKEND_PATH

vi.mock('../../../src/common/helpers/logging/logging.js', () => ({
  createLogger: vi.fn().mockReturnValue({
    error: vi.fn()
  })
}))

const { createLogger } = await import('../../../src/common/helpers/logging/logger.js')
const mockLogger = createLogger()

describe('Backend API: get', () => {
  const route = '/__TEST_ROUTE__'

  beforeEach(() => {
    config.load({})
    config.validate({ allowed: 'strict' })

    vi.spyOn(config, 'get').mockImplementation(value => {
      if (value === 'backend.endpoint') return endpoint
      if (value === 'backend.path') return path
      return config[value]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('service uses the env variable to connect to backend service', async () => {
    const mockGet = vi.fn()
    vi.spyOn(Wreck, 'get').mockImplementation(mockGet)

    await get(route)

    expect(mockGet).toHaveBeenCalledWith(`${endpoint}${path}${route}`)
  })

  test('get function handles error', async () => {
    const mockLoggerError = vi.fn()
    mockLogger.error = mockLoggerError

    const mockGet = vi.fn().mockRejectedValue(null)
    vi.spyOn(Wreck, 'get').mockImplementation(mockGet)


    await get(route)

    expect(mockGet).toHaveBeenCalledWith(`${endpoint}${path}${route}`)
    expect(mockLoggerError).toHaveBeenCalled()
  })
})
