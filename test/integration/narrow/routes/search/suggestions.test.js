import { vi, describe, afterAll, beforeAll, test, expect } from 'vitest'
import http2 from 'node:http2'
import { createServer } from '../../../../../src/server.js'
import { getOptions } from '../../../../utils/helpers.js'
import mockSuggestions from '../../../../data/mock-suggestions.js'
import { fetchSearchSuggestions } from '../../../../../src/services/fetch-search-suggestions.js'

const { constants: httpConstants } = http2

vi.mock('../../../../../src/services/fetch-search-suggestions.js', () => ({
  fetchSearchSuggestions: vi.fn()
}))

describe('Suggestions route', () => {
  let server
  let response

  beforeAll(async () => {
    fetchSearchSuggestions.mockReturnValue(mockSuggestions)

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
    response = await server.inject(getOptions('suggestions', 'GET', { searchString: 'Test String' }))
    expect(response.statusCode).toBe(httpConstants.HTTP_STATUS_OK)
  })

  test('GET /suggestions returns 400 error when searchString is not in the query params', async () => {
    response = await server.inject(getOptions('suggestions'))
    expect(response.statusCode).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST)
  })

  test('GET /suggestions returns 200 ok when searchString contains % special characters', async () => {
    response = await server.inject(getOptions('suggestions', 'GET', { searchString: ('%Test String') }))
    expect(response.statusCode).toBe(httpConstants.HTTP_STATUS_OK)
  })

  test('GET /suggestions returns 200 ok when searchString contains special character like \', -, !, @, £, $, ^, &, *, (, )', async () => {
    response = await server.inject(getOptions('suggestions', 'GET', { searchString: ("special character like ' , -, !, @, £, $, ^, &, *, (, )") }))
    expect(response.statusCode).toBe(httpConstants.HTTP_STATUS_OK)
  })

  test('GET /suggestions returns status 200 when searchString contains a single quote or hyphen', async () => {
    response = await server.inject(getOptions('suggestions', 'GET', { searchString: "Test String ' -" }))
    expect(response.statusCode).toBe(httpConstants.HTTP_STATUS_OK)
  })

  test('GET /suggestions returns mocked data', async () => {
    response = await server.inject(getOptions('suggestions', 'GET', { searchString: 'Test String' }))
    expect(response.payload).toEqual(JSON.stringify(mockSuggestions))
  })

  test('GET /suggestions returns 200 when searchString exceeds 32 characters', async () => {
    response = await server.inject(getOptions('suggestions', 'GET', { searchString: 'a'.repeat(40) }))
    expect(response.statusCode).toBe(httpConstants.HTTP_STATUS_OK)
  })

  test('GET /suggestions trims searchString to 32 characters before calling the service', async () => {
    const longString = 'A search request with a very long input value more than 32 characters'
    response = await server.inject(getOptions('suggestions', 'GET', { searchString: longString }))
    expect(fetchSearchSuggestions).toHaveBeenCalledWith(longString.slice(0, 32))
  })
})
