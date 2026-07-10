import { getStream } from '../../api/get-stream.js'
import { metricsCounter } from '../../common/helpers/metrics.js'

export const downloadAllSchemePaymentData = {
  method: 'GET',
  path: '/all-scheme-payment-data/file',
  handler: async function (request, h) {
    request.logger.info({
      message: 'Download all data',
      event: { action: 'download-all', category: 'download' }
    })
    metricsCounter('Download_All')

    const stream = await getStream('/file')

    return h
      .response(stream)
      .type('text/csv')
      .header(
        'Content-Disposition',
        'attachment; filename="ffc-payment-data.csv"'
      )
  }
}
