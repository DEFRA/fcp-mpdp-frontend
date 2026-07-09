import { getBufferFromUrl } from '../../api/get-buffer-from-url.js'
import { metricsCounter } from '../../common/helpers/metrics.js'

export const downloadSchemePaymentsByYear = {
  method: 'GET',
  path: '/scheme-payments-by-year/file',
  handler: async function (request, h) {
    request.logger.info({
      message: 'Download scheme payments by year',
      event: { action: 'download-summary', category: 'download' }
    })
    metricsCounter('Download_Summary')

    const content = await getBufferFromUrl('/summary/file')

    return h
      .response(content)
      .type('text/csv')
      .header(
        'Content-Disposition',
        'attachment; filename="ffc-payments-by-year.csv"'
      )
  }
}
