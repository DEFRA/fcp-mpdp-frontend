import { config } from '../config/config.js'
import { post } from '../api/post.js'

export async function fetchPaymentData (
  searchString,
  offset,
  filterBy,
  sortBy,
  action,
  limit = config.get('search.limit')
) {
  const result = await post('', {
    searchString,
    limit,
    offset,
    filterBy,
    sortBy,
    action
  })

  return {
    results: result.rows,
    total: result.count,
    filterOptions: result.filterOptions
  }
}
