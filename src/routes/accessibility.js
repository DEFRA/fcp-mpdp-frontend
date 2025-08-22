export const accessibility = {
  method: 'GET',
  path: '/accessibility',
  handler: function (_request, h) {
    return h.response('accessibility')
  }
}
