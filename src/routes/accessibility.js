import { getRelatedContentLinks } from '../common/utils/related-content.js'
import { isSafeRedirect } from '../common/utils/is-safe-redirect.js'

export const accessibility = {
  method: 'GET',
  path: '/accessibility',
  handler: function (request, h) {
    return h.view(
      'accessibility',
      {
        referer: isSafeRedirect(request.headers.referer) ? request.headers.referer : '',
        pageTitle: 'Accessibility statement for Find farm and land payment data',
        relatedContentLinks: getRelatedContentLinks('accessibility')
      }
    )
  }
}
