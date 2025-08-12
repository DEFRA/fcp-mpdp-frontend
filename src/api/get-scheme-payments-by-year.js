// import { getUrlParams } from './get-url-params.js'
// import { get } from './get.js'
import Wreck from '@hapi/wreck'
import { config } from '../config/config.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

export async function getSchemePaymentsByYear () {
  const url = getUrlParams('summary')
  const response = await get(url)

  if (!response) {
    return null
  }

  return JSON.parse(response.payload)
}

function getUrlParams (page, params = {}) {
  if (Object.keys(params).length === 0) {
    return `/${page}`
  }

  return `/${page}?${new URLSearchParams(params).toString()}`
}

async function get (url) {
  try {
    return (await Wreck.get(`${config.get('backend.endpoint')}${config.get('backend.path')}${url}`))
  } catch (error) {
    logger.error(`Encountered error while calling the backend with url: ${config.backendEndpoint}${url}}`, error)
    return null
  }
}
