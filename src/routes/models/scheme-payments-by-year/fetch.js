import { getSchemePaymentsByYear } from '../../../api/get-scheme-payments-by-year.js'

export async function fetchSchemePaymentsByYear () {
  const schemePaymentsByYear = await getSchemePaymentsByYear()

  if (!schemePaymentsByYear) {
    throw new Error()
  }

  return schemePaymentsByYear
}
