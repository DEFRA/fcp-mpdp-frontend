import Joi from 'joi'
import { fetchSearchSuggestions } from '../../services/fetch-search-suggestions.js'

export const suggestions = {
  method: 'GET',
  path: '/suggestions',
  options: {
    validate: {
      query: Joi.object({
        searchString: Joi.string().trim().min(3).required()
      }),
      failAction: async function (_request, h, error) {
        return h.response(error.toString()).code(400).takeover()
      }
    },
    handler: async function (request, h) {
      return h.response(await fetchSearchSuggestions(request.query.searchString))
    }
  }
}
