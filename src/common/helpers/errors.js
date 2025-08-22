import http2 from 'node:http2'
import { nunjucksEnvironment } from '../../config/nunjucks/nunjucks.js'
import { context } from '../../config/nunjucks/context.js'

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

  const pageContext = context(request)

  if (statusCode === httpConstants.HTTP_STATUS_NOT_FOUND) {
    // Render the template manually using Nunjucks
    const html = nunjucksEnvironment.render('errors/404.njk', {
      ...pageContext,
      pageTitle: 'Page not found'
    })

    response.output.payload = html
    response.output.headers = response.output.headers || {}
    response.output.headers['content-type'] = 'text/html; charset=utf-8'
    response.output.statusCode = statusCode
  } else {
    const html = nunjucksEnvironment.render('errors/500.njk', {
      ...pageContext,
      pageTitle: 'Sorry, there is a problem with the service'
    })

    response.output.payload = html
    response.output.headers = response.output.headers || {}
    response.output.headers['content-type'] = 'text/html; charset=utf-8'
    response.output.statusCode = statusCode
  }

  return h.continue
}
