import http2 from 'node:http2'
import { get } from '../../api/get.js'

const { constants: httpConstants } = http2

export const downloadSchemePaymentsByYearSummary = {
  method: 'GET',
  path: '/download-scheme-payments-by-year-summary',
  handler: async function (_request, h) {
    try {
      const content = await get('/summary/file')

      return h
        .response(content?.payload)
        .type('application/csv')
        .header(
          'Content-Disposition',
          'attachment; filename="ffc-payments-by-year.csv"'
        )
    } catch (err) {
      return h.response(err).code(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}
