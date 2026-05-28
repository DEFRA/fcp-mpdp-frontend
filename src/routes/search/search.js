import { getRelatedContentLinks } from '../../common/utils/related-content.js'
import { isSafeRedirect } from '../../common/utils/is-safe-redirect.js'

export const search = {
  method: 'GET',
  path: '/search',
  handler: function (request, h) {
    return h.view(
      'search/index',
      {
        referer: isSafeRedirect(request.headers.referer) ? request.headers.referer : '',
        pageTitle: 'Search for an agreement holder',
        relatedContentLinks: getRelatedContentLinks('search')
      }
    )
  }
}
