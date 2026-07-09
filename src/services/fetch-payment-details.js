import { get } from '../api/get.js'
import { getUrlParams } from '../api/get-url-params.js'

export async function fetchPaymentDetails (payeeName, partPostcode) {
  const url = getUrlParams(`${encodeURIComponent(payeeName)}/${encodeURIComponent(partPostcode)}`)
  return get(url)
}
