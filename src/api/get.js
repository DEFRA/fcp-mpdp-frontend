import Wreck from '@hapi/wreck'
import { buildBackendUrl } from './build-backend-url.js'
import { handleBackendRequest } from './handle-backend-request.js'

export async function get (url) {
  const backendUrl = buildBackendUrl(url)

  return await handleBackendRequest(
    backendUrl,
    Wreck.get(backendUrl)
  )
}
