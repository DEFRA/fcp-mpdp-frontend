import Wreck from '@hapi/wreck'
import { buildBackendUrl } from '../common/utils/build-backend-url.js'
import { logBackendError } from '../common/utils/log-backend-error.js'

export async function get (url) {
  const backendUrl = buildBackendUrl(url)

  try {
    return await Wreck.get(backendUrl)
  } catch (err) {
    logBackendError(backendUrl, err)
    throw err
  }
}
