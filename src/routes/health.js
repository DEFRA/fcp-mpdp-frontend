import { StatusCodes } from 'http-status-codes'

export const health = {
  method: 'GET',
  path: '/health',
  handler: function (_request, h) {
    return h.response('ok').code(StatusCodes.OK)
  }
}
