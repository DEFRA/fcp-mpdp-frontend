import { describe, beforeAll, afterAll, test, expect } from 'vitest'
import http2 from 'node:http2'
import * as cheerio from 'cheerio'
import { createServer } from '../../../../src/server.js'
import { getOptions } from '../../../utils/helpers.js'
import { expectTitle } from '../../../utils/title-expect.js'
import { expectHeader } from '../../../utils/header-expect.js'
import { expectPhaseBanner } from '../../../utils/phase-banner-expect.js'
import { expectFooter } from '../../../utils/footer-expect.js'
import { expectRelatedContent } from '../../../utils/related-content-expect.js'
 
const { constants: httpConstants } = http2
 
describe('Accessibility route', () => {
  let server
 
  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })
 
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })
 
  test('Should return status code 200 and render expected content when hitting /accessibility', async () => {
    const options = getOptions('accessibility', 'GET')
    const response = await server.inject(options)
 
    const $ = cheerio.load(response.payload)
 
    expect(response.statusCode).toBe(httpConstants.HTTP_STATUS_OK)

    expectTitle($, 'Accessibility statement for Find Farm and Land Payment Data')
    expectHeader($)
    expectPhaseBanner($)
    expectFooter($)
    expectRelatedContent($, 'accessibility')
  })

  test('Should render a back link with referer', async () => {
    const options = getOptions('accessibility', 'GET')

    options.headers = {
      referer: '/previous-page'
    }

    const response = await server.inject(options)
    const $ = cheerio.load(response.payload)
    const backLink = $('.govuk-back-link')

    expect(backLink).toBeDefined()
    expect(backLink.attr('href')).toBe('/previous-page')
    expect(backLink.text()).toBe('Back')
  })
})
 