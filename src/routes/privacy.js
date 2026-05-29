import { getRelatedContentLinks } from '../common/utils/related-content.js'
import { getRefererPath } from '../common/utils/get-referer-path.js'

export const privacy = {
  method: 'GET',
  path: '/privacy',
  handler: function (request, h) {
    return h.view(
      'privacy',
      {
        referer: getRefererPath(request.headers.referer, request.info.hostname),
        pageTitle: 'Privacy notice',
        relatedContentLinks: getRelatedContentLinks('privacy')
      }
    )
  }
}
