import fetch from 'node-fetch'
import { config } from '../config/config.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

export async function get (url) {
  try {
    return (await fetch(`${config.get('backend.endpoint')}${config.get('backend.path')}${url}`))
  } catch (error) {
    logger.error(`Encountered error while calling the backend with url: ${config.backendEndpoint}${url}}`, error)
    return null
  }
}
