import Wreck from '@hapi/wreck'
import { buildBackendUrl } from '../../api/build-backend-url.js'

export const downloadAllSchemePaymentData = {
  method: 'GET',
  path: '/all-scheme-payment-data/file',
  handler: async function (_request, h) {
    const backendUrl = buildBackendUrl('/file')
    const stream = await Wreck.request('get', backendUrl)

    return h
      .response(stream)
      .type('application/csv')
      .header(
        'Content-Disposition',
        'attachment; filename="ffc-payment-data.csv"'
      )
  }
}
