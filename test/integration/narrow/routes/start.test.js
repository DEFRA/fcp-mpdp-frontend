import { describe, beforeAll, afterAll, test, expect } from 'vitest'
import http2 from 'node:http2'
import * as cheerio from 'cheerio'
import { createServer } from '../../../../src/server.js'
import { getOptions } from '../../../utils/helpers.js'
import { expectTitle } from '../../../utils/title-expect.js'
import { expectHeader } from '../../../utils/header-expect.js'
import { expectFooter } from '../../../utils/footer-expect.js'
import { expectRelatedContent } from '../../../utils/related-content-expect.js'

const { constants: httpConstants } = http2

describe('Start route', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should return status code 200 and render expected content when hitting the start page', async () => {
    const options = getOptions('/', 'GET')
    const response = await server.inject(options)

    const $ = cheerio.load(response.payload)
    const button = $('.govuk-main-wrapper .govuk-button')

    expect(response.statusCode).toBe(httpConstants.HTTP_STATUS_OK)

    expectTitle($, '')
    expectHeader($)
    expect($('h1').text()).toEqual('Find farm and land payment data')
    expect($('#published-data')).toBeDefined()
    expect(button.text()).toMatch('Start now')
    expect(button.attr('href')).toMatch('#')
    expectRelatedContent($)
    expectFooter($)
  })
})
