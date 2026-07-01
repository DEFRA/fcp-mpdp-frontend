import { getBufferFromUrl } from '../../api/get-buffer-from-url.js'

export const downloadSchemePaymentsByYear = {
  method: 'GET',
  path: '/scheme-payments-by-year/file',
  handler: async function (_request, h) {
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
