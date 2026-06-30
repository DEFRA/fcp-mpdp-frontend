import { getUrlParams } from '../api/get-url-params.js'
import { get } from '../api/get.js'

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
    if (err.output?.statusCode === 404) {
      return { rows: [], count: 0 }
    }
    throw err
  }
}
