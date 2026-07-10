import Joi from 'joi'
import http2 from 'node:http2'
import { fetchPaymentDetailsForDownload } from '../../services/fetch-payment-details-for-download.js'

const { constants: httpConstants } = http2

export const downloadDetails = {
  method: 'GET',
  path: '/details/file',
  options: {
    validate: {
      query: Joi.object({
        payeeName: Joi.string().trim().required(),
        partPostcode: Joi.string().trim().required()
      }),
      failAction: async function (_request, h, _error) {
        return h
          .response({ message: 'Bad Request' })
          .code(httpConstants.HTTP_STATUS_BAD_REQUEST)
          .takeover()
      }
    },
    handler: async function (request, h) {
      const { payeeName, partPostcode } = request.query

      request.logger.info({
        message: 'Download payee detail',
        event: { action: 'download-detail', category: 'download' }
      })
      request.metrics.counter('Download_Detail')

      const content = await fetchPaymentDetailsForDownload(payeeName, partPostcode)

      return h
        .response(content)
        .type('text/csv')
        .header('Content-Disposition', 'attachment; filename="ffc-payment-details.csv"')
    }
  }
}
