import { describe, beforeAll, afterAll, test, expect, vi } from 'vitest'
import * as cheerio from 'cheerio'
import http2 from 'node:http2'
import { createServer } from '../../../../../src/server.js'
import { getOptions } from '../../../../utils/helpers.js'
import { mockResults } from '../../../../data/mock-results.js'
import { expectPageTitle } from '../../../../utils/page-title-expect.js'
import { expectHeader } from '../../../../utils/header-expect.js'
import { expectPhaseBanner } from '../../../../utils/phase-banner-expect.js'
import { expectBackLink } from '../../../../utils/back-link-expect.js'
import { expectPageHeading } from '../../../../utils/page-heading-expect.js'
import { expectFooter } from '../../../../utils/footer-expect.js'

const { constants: httpConstants } = http2

vi.mock('../../../../../src/services/fetch-payment-data.js', () => ({
  fetchPaymentData: () => ({
    results: mockResults,
    total: mockResults.length,
    filterOptions: {
      schemes: [...new Set(mockResults.map(x => x.scheme))],
      years: [...new Set(mockResults.map(x => x.year))],
      counties: [...new Set(mockResults.map(x => x.county_council))]
    }
  })
}))

describe('Results route', () => {
  let searchString
  let server
  let response
  let options
  let $

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()

    searchString = 'Sons'
    options = getOptions('results', 'GET', { searchString })
    response = await server.inject(options)
    $ = cheerio.load(response.payload)
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  describe('GET /results route with query parameters returns results page', () => {
    test('Should return status code 200 when hitting /results', () => {
      expect(response.statusCode).toBe(httpConstants.HTTP_STATUS_OK)
    })

    test('Should render common elements', () => {
      expectPageTitle($, `Results for ‘${searchString}’`)
      expectHeader($)
      expectPhaseBanner($)
      expectBackLink($, '/search', 'Back')
      expectPageHeading($, `Results for ‘${searchString}’`)
      expectFooter($)
    })

    test('Search box is present on results page', () => {
      const searchButton = $('.govuk-button')
      const searchBox = $('#results-search-input')

      expect(searchButton).toBeDefined()
      expect(searchButton.text()).toMatch('Search')

      expect(searchBox).toBeDefined()
      expect(searchBox.val()).toMatch(searchString)
    })

    test('Next button on pagination is present on the results page', () => {
      const nextButton = $('#next-option')
      expect(nextButton).toBeDefined()
    })

    test('Total results show the real number', () => {
      expect($('#total-results').text()).toMatch(`${mockResults.length} results`)
    })
  })

  describe('GET /results route with pagination returns new results with each page', () => {
    beforeAll(async () => {
      server = await createServer()
      await server.initialize()

      options = getOptions(
        'results',
        'GET',
        {
          searchString,
          page: 3
        }
      )

      response = await server.inject(options)
      $ = cheerio.load(response.payload)
    })

    afterAll(async () => {
      await server.stop({ timeout: 0 })
    })

    test('Search returns status code 200', () => {
      expect(response.statusCode).toBe(httpConstants.HTTP_STATUS_OK)
    })

    test('Should render page heading with searchString', () => {
      expectPageHeading($, `Results for ‘${searchString}’`)
    })

    test('Search box is present on results page', () => {
      const searchButton = $('.govuk-button')
      const searchBox = $('#results-search-input')

      expect(searchButton).toBeDefined()
      expect(searchButton.text()).toMatch('Search')

      expect(searchBox).toBeDefined()
      expect(searchBox.val()).toMatch(searchString)
    })

    test('Next and previous buttons on pagination is present on the results page', () => {
      const nextButton = $('#next-option')
      expect(nextButton).toBeDefined()

      const previousButton = $('#prev-option')
      expect(previousButton).toBeDefined()
    })

    test('Total results show the real number', () => {
      expect($('#total-results').text()).toMatch(`${mockResults.length} results`)
    })
  })

  describe('GET /results fails & redirects gracefully when query is empty', () => {
    beforeAll(async () => {
      server = await createServer()
      await server.initialize()

      options = getOptions('results', 'GET')

      response = await server.inject(options)
      $ = cheerio.load(response.payload)
    })

    afterAll(async () => {
      await server.stop({ timeout: 0 })
    })

    test('renders the search/index view with error when query object is empty', async () => {
      expect(response.statusCode).toBe(400)
      expect($('.govuk-error-summary__title').text()).toContain('There is a problem')
      expect($('.govuk-heading-l').text()).toContain('Search for an agreement holder')
      expect($('#search-input-error').text()).toContain('Error: Enter a name or location')
    })

    test('renders the search/index view with Joi error message if query string is invalid', async () => {
      options = getOptions('results', 'GET', { searchString: 'test', page: 'page-number' })
      response = await server.inject(options)
      $ = cheerio.load(response.payload)

      expect(response.statusCode).toBe(400)
      expect($('.govuk-error-summary__title').text()).toContain('There is a problem')
      expect($('.govuk-error-summary__list').text()).toMatch(/"page" must be a number/)
    })
  })
})
