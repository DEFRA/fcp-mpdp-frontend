import { StatusCodes } from 'http-status-codes'

function statusCodeMessage (statusCode) {
  switch (statusCode) {
    case StatusCodes.NOT_FOUND:
      return 'Page not found'
    case StatusCodes.FORBIDDEN:
      return 'Forbidden'
    case StatusCodes.UNAUTHORIZED:
      return 'Unauthorized'
    case StatusCodes.BAD_REQUEST:
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

  if (statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) {
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
