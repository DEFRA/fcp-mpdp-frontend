import { getRelatedContentLinks } from '../common/utils/related-content.js'
import { getSafeRedirect } from '../common/utils/get-safe-redirect.js'

export const privacy = {
  method: 'GET',
  path: '/privacy',
  handler: function (request, h) {
    return h.view(
      'privacy',
      {
        referer: getSafeRedirect(request.headers.referer),
        pageTitle: 'Privacy notice',
        relatedContentLinks: getRelatedContentLinks('privacy')
      }
    )
  }
}
