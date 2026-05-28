import { getRelatedContentLinks } from '../common/utils/related-content.js'
import { isSafeRedirect } from '../common/utils/is-safe-redirect.js'

export const privacy = {
  method: 'GET',
  path: '/privacy',
  handler: function (request, h) {
    return h.view(
      'privacy',
      {
        referer: isSafeRedirect(request.headers.referer) ? request.headers.referer : '',
        pageTitle: 'Privacy notice',
        relatedContentLinks: getRelatedContentLinks('privacy')
      }
    )
  }
}
