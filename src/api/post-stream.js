import Wreck from '@hapi/wreck'
import { buildBackendUrl } from './build-backend-url.js'
import { logBackendError } from './log-backend-error.js'
import { getBackendAuthHeaders } from './get-backend-auth-headers.js'

export async function postStream (path, payload) {
  let backendUrl

  try {
    backendUrl = buildBackendUrl(path)
    const headers = getBackendAuthHeaders()
    const stream = await Wreck.request('post', backendUrl, { payload, headers })

    return stream
  } catch (err) {
    logBackendError(backendUrl, err)
    throw err
  }
}
