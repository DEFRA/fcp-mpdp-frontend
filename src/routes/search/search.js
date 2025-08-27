import { getRelatedContentLinks } from '../../common/utils/related-content.js'

export const search = {
  method: 'GET',
  path: '/search',
  handler: function (request, h) {
    return h.view(
      'search/search',
      {
        referer: request.headers.referer,
        pageTitle: 'Search for an agreement holder',
        relatedContent: getRelatedContentLinks('search')
      }
    )
  }
}
