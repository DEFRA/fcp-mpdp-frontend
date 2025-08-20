import Wreck from '@hapi/wreck'
import { config } from '../config/config.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

export async function get (url) {
  try {
    return await Wreck.get(`${config.get('backend.endpoint')}${config.get('backend.path')}${url}`)
  } catch (error) {
    logger.error(`Encountered error while calling the backend with url: ${config.backendEndpoint}${url}}`, error)
  }
}
