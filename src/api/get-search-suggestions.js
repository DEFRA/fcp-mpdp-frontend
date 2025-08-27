import { getUrlParams } from './get-url-params.js'
import { get } from './get.js'

export async function getSearchSuggestions (searchString) {
  const url = getUrlParams('search', {
    searchString
  })

  const response = await get(url)

  if (!response) {
    return { rows: [], count: 0 }
  }

  return JSON.parse(response.payload)
}
