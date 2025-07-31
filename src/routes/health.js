import { constants as statusCodes } from 'http2'

export const health = {
  method: 'GET',
  path: '/health',
  handler: function (_request, h) {
    return h.response('ok').code(statusCodes.HTTP_STATUS_OK)
  }
}