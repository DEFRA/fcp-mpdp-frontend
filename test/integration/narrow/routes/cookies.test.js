import { describe, beforeAll, afterAll, test, expect } from 'vitest'
import http2 from 'node:http2'
import * as cheerio from 'cheerio'
import { config } from '../../../../src/config/config.js'
import { createServer } from '../../../../src/server.js'
import { getOptions } from '../../../utils/helpers.js'
import { expectPageTitle } from '../../../utils/page-title-expect.js'
import { expectHeader } from '../../../utils/header-expect.js'
import { expectPhaseBanner } from '../../../utils/phase-banner-expect.js'
import { expectBackLink } from '../../../utils/back-link-expect.js'
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

  test('Should render a back link with referer', async () => {
    options.headers = {
      referer: '/previous-page'
    }

    response = await server.inject(options)
    $ = cheerio.load(response.payload)

    expectBackLink($, '/previous-page', 'Back')
  })

  test('Should not use an external URL as the back link href', async () => {
    options = getOptions('cookies', 'GET')
    options.headers = {
      referer: 'https://evil.com'
    }

    response = await server.inject(options)
    $ = cheerio.load(response.payload)

    expectBackLink($, '', 'Back')
  })

  test('Should not use a javascript URI as the back link href', async () => {
    options = getOptions('cookies', 'GET')
    options.headers = {
      referer: 'javascript:alert(1)'
    }

    response = await server.inject(options)
    $ = cheerio.load(response.payload)

    expectBackLink($, '', 'Back')
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
    const getResponse = await server.inject(getOptions('cookies', 'GET'))
    const $ = cheerio.load(getResponse.payload)
    const cookies = getResponse.headers['set-cookie']
    const crumb = $('input[name="crumb"]').val()

    const options = {
      method: 'POST',
      url: '/cookies',
      headers: {
        cookie: cookies ? cookies.join(';') : ''
      },
      payload: {
        analytics: true,
        async: true,
        crumb
      }
    }

    const result = await server.inject(options)

    expect(result.statusCode).toBe(httpConstants.HTTP_STATUS_OK)
  })

  test('POST /cookies invalid returns 400', async () => {
    const getResponse = await server.inject(getOptions('cookies', 'GET'))
    const $ = cheerio.load(getResponse.payload)
    const cookies = getResponse.headers['set-cookie']
    const crumb = $('input[name="crumb"]').val()

    const options = {
      method: 'POST',
      url: '/cookies',
      headers: {
        cookie: cookies ? cookies.join(';') : ''
      },
      payload: {
        invalid: 'aaaaaa',
        crumb
      }
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

  test('POST /cookies with valid returnUrl redirects to that URL', async () => {
    const getResponse = await server.inject(getOptions('cookies', 'GET'))
    const $page = cheerio.load(getResponse.payload)
    const cookies = getResponse.headers['set-cookie']
    const crumb = $page('input[name="crumb"]').val()

    const result = await server.inject({
      method: 'POST',
      url: '/cookies',
      headers: {
        cookie: cookies ? cookies.join(';') : ''
      },
      payload: {
        analytics: true,
        async: false,
        returnUrl: '/search',
        crumb
      }
    })

    expect(result.statusCode).toBe(httpConstants.HTTP_STATUS_FOUND)
    expect(result.headers.location).toBe('/search')
  })

  test('POST /cookies with external returnUrl falls through to policy view', async () => {
    const getResponse = await server.inject(getOptions('cookies', 'GET'))
    const $page = cheerio.load(getResponse.payload)
    const cookies = getResponse.headers['set-cookie']
    const crumb = $page('input[name="crumb"]').val()

    const result = await server.inject({
      method: 'POST',
      url: '/cookies',
      headers: {
        cookie: cookies ? cookies.join(';') : ''
      },
      payload: {
        analytics: true,
        async: false,
        returnUrl: 'https://evil.example.com',
        crumb
      }
    })

    expect(result.statusCode).toBe(httpConstants.HTTP_STATUS_OK)
    expect(result.request.response.source.template).toBe('cookies/policy')
  })

  test('POST /cookies with protocol-relative returnUrl falls through to policy view', async () => {
    const getResponse = await server.inject(getOptions('cookies', 'GET'))
    const $page = cheerio.load(getResponse.payload)
    const cookies = getResponse.headers['set-cookie']
    const crumb = $page('input[name="crumb"]').val()

    const result = await server.inject({
      method: 'POST',
      url: '/cookies',
      headers: {
        cookie: cookies ? cookies.join(';') : ''
      },
      payload: {
        analytics: false,
        async: false,
        returnUrl: '//evil.example.com',
        crumb
      }
    })

    expect(result.statusCode).toBe(httpConstants.HTTP_STATUS_OK)
    expect(result.request.response.source.template).toBe('cookies/policy')
  })

  test('POST /cookies with returnUrl exceeding 2000 chars returns 400', async () => {
    const getResponse = await server.inject(getOptions('cookies', 'GET'))
    const $page = cheerio.load(getResponse.payload)
    const cookies = getResponse.headers['set-cookie']
    const crumb = $page('input[name="crumb"]').val()

    const result = await server.inject({
      method: 'POST',
      url: '/cookies',
      headers: {
        cookie: cookies ? cookies.join(';') : ''
      },
      payload: {
        analytics: true,
        async: false,
        returnUrl: '/' + 'a'.repeat(2001),
        crumb
      }
    })

    expect(result.statusCode).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST)
  })

  test('POST /cookies without analytics field returns 400', async () => {
    const getResponse = await server.inject(getOptions('cookies', 'GET'))
    const $page = cheerio.load(getResponse.payload)
    const cookies = getResponse.headers['set-cookie']
    const crumb = $page('input[name="crumb"]').val()

    const result = await server.inject({
      method: 'POST',
      url: '/cookies',
      headers: {
        cookie: cookies ? cookies.join(';') : ''
      },
      payload: {
        async: false,
        crumb
        // analytics intentionally omitted
      }
    })

    expect(result.statusCode).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST)
  })

  test('does not expire GA cookies on first visit before user has made a choice', async () => {
    const firstVisit = await server.inject({
      method: 'GET',
      url: '/cookies',
      headers: {
        cookie: '_ga=GA1.1.123456789.1234567890; _gid=GA1.1.987654321.1234567890'
      }
    })

    const setCookieHeaders = [firstVisit.headers['set-cookie']].flat().filter(Boolean)
    const expiresGa = setCookieHeaders.some(
      (h) => (h.startsWith('_ga') || h.startsWith('_gid')) && h.includes('expires=Thu, 01 Jan 1970')
    )

    expect(expiresGa).toBe(false)
  })
})
