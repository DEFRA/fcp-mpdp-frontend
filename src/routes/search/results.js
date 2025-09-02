import { resultsModel } from '../models/search/results.js'
import { resultsQuery as query } from '../queries/results.js'

export const results = {
  method: 'GET',
  path: '/results',
  options: {
    validate: {
      query,
      failAction: async function (request, h, error) {
        const { searchString, pageId } = request.query

        if (!(searchString?.trim())) {
          return h.view(
            `search/${pageId || 'search'}`,
            await resultsModel(request, error)
          ).code(400).takeover()
        }

        return h.view('search/search', { ...request.query, errorList: [{ text: error.details[0].message }] }).code(400).takeover()
      }
    },
    handler: async function (request, h) {
      const { searchString } = request.query
      request.query.searchString = encodeURIComponent(searchString)
      return h.view('search/results', await resultsModel(request))
    }
  }
}
