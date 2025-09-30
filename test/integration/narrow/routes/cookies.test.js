import { describe, beforeAll, afterAll, test, expect } from 'vitest'
import http2 from 'node:http2'
import * as cheerio from 'cheerio'
import { config } from '../../../../src/config/config.js'
import { createServer } from '../../../../src/server.js'
import { getOptions } from '../../../utils/helpers.js'
import { expectPageTitle } from '../../../utils/page-title-expect.js'
import { expectHeader } from '../../../utils/header-expect.js'
import { expectPhaseBanner } from '../../../utils/phase-banner-expect.js'
import { expectPageHeading } from '../../../utils/page-heading-expect.js'
import { expectFooter } from '../../../utils/footer-expect.js'

const { constants: httpConstants } = http2

describe('Cookies route', () => {
  let server
  let response
  let options
  let $

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()

    if (response) { return }

    options = getOptions('cookies', 'GET')

    response = await server.inject(options)
    $ = cheerio.load(response.payload)
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should return status code 200 when hitting /cookies', async () => {
    expect(response.statusCode).toBe(httpConstants.HTTP_STATUS_OK)
  })

  test('Check for common elements', () => {
    expectPageTitle($, 'Cookies')
    expectHeader($)
    expectPhaseBanner($)
    expectPageHeading($, 'Cookies')
    expectFooter($)
  })

  test('GET /cookies returns cookie policy', async () => {
    options = getOptions('cookies')
    const result = await server.inject(options)
    const response = result.request.response

    expect(response.variety).toBe('view')
    expect((response.source)?.template).toBe('cookies/policy')
  })

  test('GET /cookies context returns header', async () => {
    options = getOptions('cookies')
    const result = await server.inject(options)
    const response = result.request.response

    expect((response)._payload._data).toContain('Cookies')
  })

  test('POST /cookies returns 200 if async', async () => {
    const options = {
      method: 'POST',
      url: '/cookies',
      payload: { analytics: true, async: true }
    }

    const result = await server.inject(options)

    expect(result.statusCode).toBe(httpConstants.HTTP_STATUS_OK)
  })

  test('POST /cookies invalid returns 400', async () => {
    const options = {
      method: 'POST',
      url: '/cookies',
      payload: { invalid: 'aaaaaa' }
    }

    const result = await server.inject(options)

    expect(result.statusCode).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST)
  })

  test('Cookie banner appears when no cookie option is selected', async () => {
    options = getOptions('cookies')
    const response = await server.inject(options)

    expect(response.statusCode).toBe(httpConstants.HTTP_STATUS_OK)
    expect($('.govuk-cookie-banner h2').text()).toContain(`Cookies on ${config.get('serviceName')}`)
    expect($('.js-cookies-button-accept').text()).toContain('Accept analytics cookies')
    expect($('.js-cookies-button-reject').text()).toContain('Reject analytics cookies')
    expectPhaseBanner($)
  })
})
