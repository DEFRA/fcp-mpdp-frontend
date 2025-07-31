import { constants as httpConstants } from 'http2'

export const health = {
  method: 'GET',
  path: '/health',
  handler: function (_request, h) {
    return h.response('ok').code(httpConstants.HTTP_STATUS_OK)
  }
}