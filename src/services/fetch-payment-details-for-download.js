import { getUrlParams } from '../api/get-url-params.js'
import { getBufferFromUrl } from '../api/get-buffer-from-url.js'

export async function fetchPaymentDetailsForDownload (payeeName, partPostcode) {
  const url = getUrlParams(`${encodeURIComponent(payeeName)}/${encodeURIComponent(partPostcode)}/file`)

  return getBufferFromUrl(url)
}
