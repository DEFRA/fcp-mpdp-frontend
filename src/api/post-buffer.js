import { buildBackendUrl } from './build-backend-url.js'
import { logBackendError } from './log-backend-error.js'
import { getBackendAuthHeaders } from './get-backend-auth-headers.js'

export async function postBuffer (url, payload) {
  try {
    const backendUrl = buildBackendUrl(url)
    const headers = await getBackendAuthHeaders()
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: payload != null ? JSON.stringify(payload) : undefined,
      headers: { 'Content-Type': 'application/json', ...headers }
    })

    return Buffer.from(await response.arrayBuffer())
  } catch (err) {
    logBackendError(err)
    throw err
  }
}
