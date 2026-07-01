import { Readable } from 'node:stream'
import { buildBackendUrl } from './build-backend-url.js'
import { logBackendError } from './log-backend-error.js'
import { getBackendAuthHeaders } from './get-backend-auth-headers.js'

export async function postStream (path, payload) {
  let backendUrl

  try {
    backendUrl = buildBackendUrl(path)
    const headers = await getBackendAuthHeaders()
    const response = await fetch(backendUrl, { method: 'POST', body: payload, headers })

    return Readable.fromWeb(response.body)
  } catch (err) {
    logBackendError(backendUrl, err)
    throw err
  }
}
