import Wreck from '@hapi/wreck'
import { buildBackendUrl } from './build-backend-url.js'
import { handleBackendRequest } from './handle-backend-request.js'

export async function post (url, payload) {
  const backendUrl = buildBackendUrl(url)

  return handleBackendRequest(
    backendUrl,
    Wreck.post(backendUrl, { payload })
  )
}
