import http2 from 'node:http2'

const { constants: httpConstants } = http2

export function catchAll (request, h) {
  const { response } = request

  if (!('isBoom' in response)) {
    return h.continue
  }

  const statusCode = response.output.statusCode

  if (statusCode >= httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR) {
    request.logger.error(response?.stack)
  }

  if (statusCode === httpConstants.HTTP_STATUS_NOT_FOUND) {
    return h.view('errors/404', { pageTitle: 'Page not found' }).code(statusCode)
  }

  return h.view('errors/500', { pageTitle: 'Sorry, there is a problem with the service' }).code(statusCode)
}
