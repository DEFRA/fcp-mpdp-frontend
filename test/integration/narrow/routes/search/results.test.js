import { describe, beforeAll, afterAll, test, expect, vi } from 'vitest'
import * as cheerio from 'cheerio'
import http2 from 'node:http2'
import { createServer } from '../../../../../src/server.js'
import { getOptions } from '../../../../utils/helpers.js'

const { constants: httpConstants } = http2

vi.mock('../../../../../src/services/fetch-payment-data.js', () => ({
  fetchPaymentData: () => ({
    results: [],
    total: 0,
    filterOptions: { schemes: [], amounts: [], counties: [] }
  })
}))

describe('Results route', () => {
  let server
  let response
  let $

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()

    const options = getOptions('results', 'GET', { searchString: 'Sons' })
    response = await server.inject(options)
    $ = cheerio.load(response.payload)
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should return status code 200 when hitting /results', () => {
    expect(response.statusCode).toBe(httpConstants.HTTP_STATUS_OK)
  })

  test('Should render heading with search string', () => {
    expect($('.govuk-heading-l').text()).toContain('Results for ‘Sons’')
  })
})
