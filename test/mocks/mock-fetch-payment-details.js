import { mockDetails } from '../data/mock-details.js'

/* eslint-disable camelcase */
export function mockFetchPaymentDetails (payee_name) {
  return mockDetails.find(details => details.payee_name.toLowerCase().includes(payee_name.toLowerCase()))
}
/* eslint-enable camelcase */
