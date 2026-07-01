import { describe, test, expect, vi, afterEach } from 'vitest'
import { getBufferFromUrl } from '../../../src/api/get-buffer-from-url.js'
import { buildBackendUrl } from '../../../src/api/build-backend-url.js'
import { logBackendError } from '../../../src/api/log-backend-error.js'

vi.mock('../../../src/api/build-backend-url.js')
vi.mock('../../../src/api/log-backend-error.js')
vi.mock('../../../src/api/get-backend-auth-headers.js', () => ({
  getBackendAuthHeaders: vi.fn().mockReturnValue({})
}))

describe('getBufferFromUrl', () => {
  afterEach(() => {
    vi.resetAllMocks()
    vi.unstubAllGlobals()
  })

  test('returns payload when fetch succeeds', async () => {
    const mockUrl = '/mock/file'
    const backendUrl = 'http://fcp-mpdp-backend/mock/file'
    const mockBuffer = Buffer.from('CSV_CONTENT')

    buildBackendUrl.mockReturnValue(backendUrl)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(Uint8Array.from(mockBuffer).buffer)
    }))

    const response = await getBufferFromUrl(mockUrl)

    expect(buildBackendUrl).toHaveBeenCalledWith(mockUrl)
    expect(fetch).toHaveBeenCalledWith(backendUrl, { headers: {} })
    expect(response).toEqual(mockBuffer)
  })

  test('logs and rethrows error when fetch fails', async () => {
    const mockUrl = '/mock/file'
    const backendUrl = 'http://fcp-mpdp-backend/mock/file'
    const mockError = new Error('Mock backend failure')

    buildBackendUrl.mockReturnValue(backendUrl)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(mockError))

    await expect(getBufferFromUrl(mockUrl)).rejects.toThrow(mockError)
    expect(buildBackendUrl).toHaveBeenCalledWith(mockUrl)
    expect(logBackendError).toHaveBeenCalledWith(mockError)
  })
})
