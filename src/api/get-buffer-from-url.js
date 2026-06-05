import Wreck from '@hapi/wreck'
import { buildBackendUrl } from './build-backend-url.js'
import { logBackendError } from './log-backend-error.js'
import { getBackendAuthHeaders } from './get-backend-auth-headers.js'

export async function getBufferFromUrl (url) {
  try {
    const backendUrl = buildBackendUrl(url)
    const headers = await getBackendAuthHeaders()
    const { payload } = await Wreck.get(backendUrl, { headers })

    return payload
  } catch (err) {
    logBackendError(err)
    throw err
  }
}
