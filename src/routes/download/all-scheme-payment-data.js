import { get } from '../../api/get.js'

export const downloadAllSchemePaymentData = {
  method: 'GET',
  path: '/all-scheme-payment-data/file',
  handler: async function (_request, h) {
    const content = await get('/file')

    return h
      .response(content?.payload)
      .type('application/csv')
      .header(
        'Content-Disposition',
        'attachment; filename="ffc-payment-data.csv"'
      )
  }
}
