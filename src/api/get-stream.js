import { Readable } from 'node:stream'
import { buildBackendUrl } from './build-backend-url.js'
import { requestPromise } from './request-promise.js'
import { getBackendAuthHeaders } from './get-backend-auth-headers.js'

export async function getStream (path) {
  const backendUrl = buildBackendUrl(path)
  const headers = await getBackendAuthHeaders()

  return requestPromise(
    backendUrl,
    fetch(backendUrl, { headers }).then((response) => Readable.fromWeb(response.body))
  )
}
