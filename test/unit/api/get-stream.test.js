import { vi, describe, beforeEach, afterEach, test, expect } from 'vitest'
import { Readable } from 'node:stream'
import { config } from '../../../src/config/config.js'
import { getStream } from '../../../src/api/get-stream.js'

vi.mock('../../../src/api/get-backend-auth-headers.js', () => ({
  getBackendAuthHeaders: vi.fn().mockReturnValue({})
}))

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

describe('Backend API: getStream', () => {
  const route = '/__TEST_ROUTE__'

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
    vi.unstubAllGlobals()
  })

  test('service uses the env variable to connect to backend service (stream)', async () => {
    const mockReadable = Readable.from(['test'])
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ body: Readable.toWeb(mockReadable) }))

    await getStream(route)

    expect(fetch).toHaveBeenCalledWith(
      `${endpoint}${path}${route}`,
      { headers: {} }
    )
  })

  test('getStream function handles error', async () => {
    const mockLoggerError = vi.fn()
    mockLogger.error = mockLoggerError

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Stream error')))

    await expect(getStream(route)).rejects.toThrow('Stream error')

    expect(fetch).toHaveBeenCalledWith(
      `${endpoint}${path}${route}`,
      { headers: {} }
    )
    expect(mockLoggerError).toHaveBeenCalled()
  })
})
