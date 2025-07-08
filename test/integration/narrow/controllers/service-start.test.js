import { createServer } from '../../../../src/server/server.js'
import { statusCodes } from '../../../../src/server/common/constants/status-codes.js'

describe('#serviceStartController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/'
    })

    expect(result).toEqual(
      expect.stringContaining('Find farm and land payment data -')
    )
    expect(statusCode).toBe(statusCodes.ok)
  })
})
