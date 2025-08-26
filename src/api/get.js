import Wreck from '@hapi/wreck'
import { config } from '../config/config.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

export async function get (url) {
  const backendUrl = `${config.get('backend.endpoint')}${config.get('backend.path')}${url}`

  try {
    return await Wreck.get(backendUrl)
  } catch (err) {
    logger.error(`Encountered error while calling the backend with url: ${backendUrl}`, err)
    throw err
  }
}
