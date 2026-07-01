import { describe, test, expect, vi, afterEach } from 'vitest'
import { postBuffer } from '../../../src/api/post-buffer.js'
import { buildBackendUrl } from '../../../src/api/build-backend-url.js'
import { logBackendError } from '../../../src/api/log-backend-error.js'

vi.mock('../../../src/api/build-backend-url.js')
vi.mock('../../../src/api/log-backend-error.js')
vi.mock('../../../src/api/get-backend-auth-headers.js', () => ({
  getBackendAuthHeaders: vi.fn().mockReturnValue({})
}))

describe('postBuffer', () => {
  afterEach(() => {
    vi.resetAllMocks()
    vi.unstubAllGlobals()
  })

  test('returns buffer when fetch succeeds', async () => {
    const mockUrl = '/mock/file'
    const backendUrl = 'http://fcp-mpdp-backend/mock/file'
    const mockContent = Buffer.from('CSV_CONTENT')
    const payload = { searchString: 'test' }

    buildBackendUrl.mockReturnValue(backendUrl)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(Uint8Array.from(mockContent).buffer)
    }))

    const result = await postBuffer(mockUrl, payload)

    expect(buildBackendUrl).toHaveBeenCalledWith(mockUrl)
    expect(fetch).toHaveBeenCalledWith(backendUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    })
    expect(result).toEqual(mockContent)
  })

  test('logs and rethrows error when fetch fails', async () => {
    const mockUrl = '/mock/file'
    const backendUrl = 'http://fcp-mpdp-backend/mock/file'
    const mockError = new Error('Mock backend failure')

    buildBackendUrl.mockReturnValue(backendUrl)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(mockError))

    await expect(postBuffer(mockUrl, {})).rejects.toThrow(mockError)
    expect(logBackendError).toHaveBeenCalledWith(mockError)
  })
})
