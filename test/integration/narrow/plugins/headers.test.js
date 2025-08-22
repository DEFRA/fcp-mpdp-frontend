import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

const { createServer } = await import('../../../../src/server.js')

let server

describe('headers', () => {
  beforeEach(async () => {
    vi.clearAllMocks()

    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    if (server) {
      await server.stop()
    }
  })

  test('should prevent MIME sniffing attacks ', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['x-content-type-options']).toBe('nosniff')
  })

  test('should prevent clickjacking attacks', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['x-frame-options']).toBe('DENY')
  })

  test('should prevent robots from indexing pages', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['x-robots-tag']).toBe('noindex, nofollow')
  })

  test('should prevent cross-site scripting attacks', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['x-xss-protection']).toBe('1; mode=block')
  })

  test('should ensure pages can only interact with the same origin', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['cross-origin-opener-policy']).toBe('same-origin')
  })

  test('should ensure pages can only be embedded by the same origin', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['cross-origin-embedder-policy']).toBe('require-corp')
  })

  test('should ensure pages can only interact with the same site', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['cross-origin-resource-policy']).toBe('same-site')
  })

  test('should ensure no referrer information is leaked', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['referrer-policy']).toBe('no-referrer')
  })

  test('should restrict permissions for sensitive features', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['permissions-policy']).toBe('camera=(), geolocation=(), magnetometer=(), microphone=(), payment=(), usb=()')
  })
})
