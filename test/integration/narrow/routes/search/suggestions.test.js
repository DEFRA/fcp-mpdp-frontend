import { vi, describe, afterAll, beforeAll, test, expect } from 'vitest'
import { createServer } from '../../../../../src/server.js'
import { getOptions } from '../../../../utils/helpers.js'
import mockSuggestions from '../../../../data/mock-suggestions.js'

vi.mock('../../../../../src/api/get-search-suggestions.js', () => ({
  getSearchSuggestions: () => mockSuggestions
}))

describe('GET /suggestions route', () => {
  let server
  let response

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()

    if (response) { return }

    const options = getOptions('/suggestions', 'GET')

    response = await server.inject(options)
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
    vi.resetAllMocks()
  })

  test('GET /suggestions returns status 200', async () => {
    const res = await server.inject(getOptions('suggestions', 'GET', { searchString: 'Test String' }))
    expect(res.statusCode).toBe(200)
  })

  test('GET /suggestions returns 400 error when searchString is not in the query params', async () => {
    const res = await server.inject(getOptions('suggestions'))
    expect(res.statusCode).toBe(400)
  })

  test('GET /suggestions returns 200 ok when searchString contains % special characters', async () => {
    const res = await server.inject(getOptions('suggestions', 'GET', { searchString: ('%Test String') }))
    expect(res.statusCode).toBe(200)
  })

  test('GET /suggestions returns 200 ok when searchString contains special character like \', -, !, @, £, $, ^, &, *, (, )', async () => {
    const res = await server.inject(getOptions('suggestions', 'GET', { searchString: ("special character like ' , -, !, @, £, $, ^, &, *, (, )") }))
    expect(res.statusCode).toBe(200)
  })

  test('GET /suggestions returns status 200 when searchString contains a single quote or hyphen', async () => {
    const res = await server.inject(getOptions('suggestions', 'GET', { searchString: "Test String ' -" }))
    expect(res.statusCode).toBe(200)
  })

  test('GET /suggestions returns mocked data', async () => {
    const res = await server.inject(getOptions('suggestions', 'GET', { searchString: 'Test String' }))
    expect(res.payload).toEqual(JSON.stringify(mockSuggestions))
  })
})
