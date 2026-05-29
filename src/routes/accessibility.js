import { getRelatedContentLinks } from '../common/utils/related-content.js'
import { getRefererPath } from '../common/utils/get-referer-path.js'

export const accessibility = {
  method: 'GET',
  path: '/accessibility',
  handler: function (request, h) {
    return h.view(
      'accessibility',
      {
        referer: getRefererPath(request.headers.referer, request.info.hostname),
        pageTitle: 'Accessibility statement for Find farm and land payment data',
        relatedContentLinks: getRelatedContentLinks('accessibility')
      }
    )
  }
}
