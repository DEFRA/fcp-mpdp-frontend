import { getRelatedContentLinks } from '../../common/utils/related-content.js'
import { getSafeRedirect } from '../../common/utils/get-safe-redirect.js'

export const search = {
  method: 'GET',
  path: '/search',
  handler: function (request, h) {
    return h.view(
      'search/index',
      {
        referer: getSafeRedirect(request.headers.referer),
        pageTitle: 'Search for an agreement holder',
        relatedContentLinks: getRelatedContentLinks('search')
      }
    )
  }
}
