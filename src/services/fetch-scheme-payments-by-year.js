import { getUrlParams } from '../api/get-url-params.js'
import { get } from '../api/get.js'

export async function fetchSchemePaymentsByYear () {
  const url = getUrlParams('summary')
  return get(url)
}
