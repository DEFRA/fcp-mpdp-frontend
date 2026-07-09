import { getUrlParams } from '../api/get-url-params.js'
import { get } from '../api/get.js'

export async function fetchSearchSuggestions (searchString) {
  const url = getUrlParams('search', {
    searchString
  })

  return get(url)
}
