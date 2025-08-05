import http2 from 'node:http2'

const { constants: httpConstants } = http2

function statusCodeMessage (statusCode) {
  switch (statusCode) {
    case httpConstants.HTTP_STATUS_NOT_FOUND:
      return 'Page not found'
    case httpConstants.HTTP_STATUS_FORBIDDEN:
      return 'Forbidden'
    case httpConstants.HTTP_STATUS_UNAUTHORIZED:
      return 'Unauthorized'
    case httpConstants.HTTP_STATUS_BAD_REQUEST:
      return 'Bad Request'
    default:
      return 'Something went wrong'
  }
}

export function catchAll (request, h) {
  const { response } = request

  if (!('isBoom' in response)) {
    return h.continue
  }

  const statusCode = response.output.statusCode
  const errorMessage = statusCodeMessage(statusCode)

  if (statusCode >= httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR) {
    request.logger.error(response?.stack)
  }

  return h
    .view('error', {
      pageTitle: errorMessage,
      heading: statusCode,
      message: errorMessage
    })
    .code(statusCode)
}
