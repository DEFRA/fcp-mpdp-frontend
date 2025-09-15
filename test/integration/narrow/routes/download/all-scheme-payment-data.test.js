import { describe, beforeAll, afterAll, test, expect, vi } from 'vitest'
import Wreck from '@hapi/wreck'
import http2 from 'node:http2'
import { createServer } from '../../../../../src/server.js'
import { getOptions } from '../../../../utils/helpers.js'

const { constants: httpConstants } = http2

vi.mock('@hapi/wreck', () => ({
  default: {
    request: vi.fn()
  }
}))

describe('Download all scheme payment data CSV link', () => {
  let server
  let response
  let options

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()

    if (response) { return }

    options = getOptions('all-scheme-payment-data/file', 'GET')
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
    vi.clearAllMocks()
  })

  const content = 'Sample data in CSV'

  test('GET /all-scheme-payment-data/file returns status code 200', async () => {
    Wreck.request.mockResolvedValue(content)
    response = await server.inject(options)

    expect(response.statusCode).toBe(httpConstants.HTTP_STATUS_OK)
  })

  test('GET /all-scheme-payment-data/file returns attachment', async () => {
    Wreck.request.mockResolvedValue(content)
    response = await server.inject(options)

    expect(response.headers).toHaveProperty('content-type', 'application/csv')
    expect(response.headers).toHaveProperty('content-disposition', 'attachment; filename="ffc-payment-data.csv"')
  })

  test('GET /all-scheme-payment-data/file returns expected content', async () => {
    Wreck.request.mockResolvedValue(content)
    response = await server.inject(options)

    expect(response.result).toBe(content)
  })

  test('GET /all-scheme-payment-data/file returns status code 500 on underlying error', async () => {
    Wreck.request.mockRejectedValue('Internal server error') 
    response = await server.inject(options)

    expect(response.statusCode).toBe(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
  })
})
