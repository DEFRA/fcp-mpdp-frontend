import http2 from 'node:http2'
import { getUrlParams } from '../api/get-url-params.js'
import { get } from '../api/get.js'

const { constants: httpConstants } = http2

export async function fetchSearchSuggestions (searchString) {
  const url = getUrlParams('search', {
    searchString
  })

  try {
    const response = await get(url)

    if (!response) {
      return { rows: [], count: 0 }
    }

    return JSON.parse(response.payload)
  } catch (err) {
    if (err.output?.statusCode === httpConstants.HTTP_STATUS_NOT_FOUND) {
      return { rows: [], count: 0 }
    }
    throw err
  }
}
