import { getUrlParams } from './get-url-params.js'
import { get } from './get.js'

export async function getSchemePaymentsByYear () {
  const url = getUrlParams('summary')
  const response = await get(url)

  if (!response) {
    return null
  }

  return JSON.parse(response.payload)
}
