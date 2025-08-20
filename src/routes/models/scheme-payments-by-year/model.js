import { transformSchemePaymentsData } from './transform.js'

export async function schemePaymentsByYearModel (rawData) {
  return transformSchemePaymentsData(rawData)
}
