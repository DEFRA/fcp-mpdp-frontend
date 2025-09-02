import Wreck from '@hapi/wreck'
import { config } from '../config/config.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

export async function post (url, payload) {
  const backendUrl = `${config.get('backend.endpoint')}${config.get('backend.path')}${url}`

  try {
    return await Wreck.post(backendUrl, { payload })
  } catch (err) {
    logger.error(`Encountered error while calling the backend with url: ${url}`, err)
    throw err
  }
}
