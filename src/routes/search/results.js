import http2 from 'node:http2'
import { resultsModel } from '../models/search/results.js'
import { resultsQuery as query } from '../queries/results.js'
import { metricsCounter } from '../../common/helpers/metrics.js'

const { constants: httpConstants } = http2

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
            `search/${pageId || 'index'}`,
            {
              ...await resultsModel(request, error),
              pageTitle: 'Search for an agreement holder'
            }
          ).code(httpConstants.HTTP_STATUS_BAD_REQUEST).takeover()
        }

        return h.view(
          'search/index',
          {
            ...request.query,
            errorList: [{ text: error.details[0].message }]
          }).code(httpConstants.HTTP_STATUS_BAD_REQUEST).takeover()
      }
    },
    handler: async function (request, h) {
      const { searchString } = request.query
      request.query.searchString = encodeURIComponent(searchString)
      const model = await resultsModel(request)

      request.logger.info({
        message: 'Search results viewed',
        event: { action: 'search-results', category: 'page-view' },
        resultCount: model.results?.length ?? 0,
        page: model.currentPage ?? 1
      })
      metricsCounter('PageView_Search')

      return h.view('search/results', model)
    }
  }
}
