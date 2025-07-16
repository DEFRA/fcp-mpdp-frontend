import cheerio from 'cheerio'
import { createServer } from '../../../../src/server/server.js'
import { statusCodes } from '../../../../src/server/common/constants/status-codes.js'
import { expectPageTitle } from '../../../utils/page-title-expects.js'
import { getPageTitle } from '../../../../src/server/common/helpers/helpers.js'

describe('#startController', () => {
  let server
  const pageTitle = getPageTitle('/')

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should return status code 200 when hitting the start page', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/'
    })

    expect(response.statusCode).toBe(statusCodes.ok)
  })

  test('Should render the expected content when hitting the start page', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/'
    })

    const $ = cheerio.load(response.payload)

    expect($('h1').text()).toEqual(pageTitle)
    expectPageTitle($, pageTitle)
  })
})
