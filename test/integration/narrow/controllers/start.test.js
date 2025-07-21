import * as cheerio from 'cheerio'
import { createServer } from '../../../../src/server/server.js'
import { statusCodes } from '../../../../src/server/common/constants/status-codes.js'

describe('#startController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should return status code 200 and render expected content when hitting the start page', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/'
    })

    const $ = cheerio.load(response.payload)
    const button = $('.govuk-main-wrapper .govuk-button')

    expect(response.statusCode).toBe(statusCodes.ok)
    expect($('h1').text()).toEqual('Find farm and land payment data')
    expect(expect(button.text()).toMatch('Start now'))
    expect(button.attr('href')).toMatch('#')
    expect($('#published-data')).toBeDefined()
  })
})
