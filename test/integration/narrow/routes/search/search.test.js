import { describe, beforeAll, afterAll, test, expect } from 'vitest'
import http2 from 'node:http2'
import * as cheerio from 'cheerio'
import { createServer } from '../../../../../src/server.js'
import { getOptions } from '../../../../utils/helpers.js'
import { expectPageTitle } from '../../../../utils/page-title-expect.js'
import { expectHeader } from '../../../../utils/header-expect.js'
import { expectPhaseBanner } from '../../../../utils/phase-banner-expect.js'
import { expectPageHeading } from '../../../../utils/page-heading-expect.js'
import { expectRelatedContent } from '../../../../utils/related-content-expect.js'
import { expectFooter } from '../../../../utils/footer-expect.js'

const { constants: httpConstants } = http2

describe('Search for an agreement holder', () => {
  let server
  let response
  let $

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()

    if (response) { return }

    const options = getOptions('search', 'GET')

    response = await server.inject(options)
    $ = cheerio.load(response.payload)
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should return status code 200 when hitting /search', async () => {
    expect(response.statusCode).toBe(httpConstants.HTTP_STATUS_OK)
  })

  test('Check for common elements', () => {
    expectPageTitle($, 'Search for an agreement holder')
    expectHeader($)
    expectPhaseBanner($)
    expectPageHeading($, 'Search for an agreement holder')
    expectRelatedContent($)
    expectFooter($)
  })

  describe('Search error', () => {
    beforeAll(async () => {
      const options = getOptions('results', 'GET', { searchString: '' })
      response = await server.inject(options)
      $ = cheerio.load(response.payload)
    })

    test('Invalid query triggers error on /results', async () => {
      const errorSummary = $('.govuk-error-summary__title')

      expect(response.statusCode).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST)

      expect(errorSummary).toBeDefined()
      expect(errorSummary.text()).toMatch('There is a problem')

      expect($('#results-search-input')).toBeDefined()
      expect($('.govuk-form-group.govuk-form-group--error')).toBeDefined()
      expect($('#search-input-error').text()).toContain('Enter a name or location')
    })

    test('Should render common elements on invalid query submission', () => {
      expectPageTitle($, 'Error: Search for an agreement holder')
      expectPageHeading($, 'Search for an agreement holder')
      expectRelatedContent($)
    })
  })
})
