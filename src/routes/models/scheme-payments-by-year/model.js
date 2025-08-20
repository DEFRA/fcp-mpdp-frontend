import { fetchSchemePaymentsByYear } from './fetch.js'
import { transformSchemePaymentsData } from './transform.js'

export async function schemePaymentsByYearModel () {
  const rawData = await fetchSchemePaymentsByYear()

  return transformSchemePaymentsData(rawData)
}
