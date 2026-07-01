import { vi, describe, beforeEach, afterEach, test, expect } from 'vitest'
import { Readable } from 'node:stream'
import { config } from '../../../src/config/config.js'
import { postStream } from '../../../src/api/post-stream.js'
import { logBackendError } from '../../../src/api/log-backend-error.js'

vi.mock('../../../src/api/get-backend-auth-headers.js', () => ({
  getBackendAuthHeaders: vi.fn().mockReturnValue({})
}))

const endpoint = 'https://__TEST_ENDPOINT__'
process.env.MPDP_BACKEND_ENDPOINT = endpoint
const path = process.env.MPDP_BACKEND_PATH

vi.mock('../../../src/api/log-backend-error.js', () => ({
  logBackendError: vi.fn()
}))

describe('Backend API: postStream', () => {
  const route = '/__TEST_ROUTE__'
  const url = `${endpoint}${path}${route}`

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

  test('calls fetch with correct parameters and returns a Readable stream', async () => {
    const mockReadable = Readable.from(['test'])
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ body: Readable.toWeb(mockReadable) }))

    const result = await postStream(route, { content: 'mock data' })

    expect(fetch).toHaveBeenCalledWith(
      url,
      {
        method: 'POST',
        body: { content: 'mock data' },
        headers: {}
      }
    )

    expect(result).toBeInstanceOf(Readable)
  })

  test('logs error and rethrows when fetch rejects', async () => {
    const mockError = new Error('Test stream error')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(mockError))

    await expect(postStream(route, {})).rejects.toThrow('Test stream error')

    expect(fetch).toHaveBeenCalledWith(
      url,
      { method: 'POST', body: {}, headers: {} }
    )

    expect(logBackendError).toHaveBeenCalledWith(url, mockError)
  })
})
