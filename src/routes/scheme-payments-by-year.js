// import { schemePaymentsByYearModel } from './models/scheme-payments-by-year.js'

export const schemePaymentsByYear = {
  method: 'GET',
  path: '/schemePaymentsByYear',
  handler: async function (_request, h) {
    return h.view(
      'scheme-payments-by-year',
      { pageTitle: 'Scheme payments by year' }
      // await schemePaymentsByYearModel()
    )
  }
}
