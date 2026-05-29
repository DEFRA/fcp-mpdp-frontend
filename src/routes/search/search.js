import { getRelatedContentLinks } from '../../common/utils/related-content.js'
import { getRefererPath } from '../../common/utils/get-referer-path.js'

export const search = {
  method: 'GET',
  path: '/search',
  handler: function (request, h) {
    return h.view(
      'search/index',
      {
        referer: getRefererPath(request.headers.referer, request.info.hostname),
        pageTitle: 'Search for an agreement holder',
        relatedContentLinks: getRelatedContentLinks('search')
      }
    )
  }
}
