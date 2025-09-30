import { config } from '../config/config.js'
import { getCurrentPolicy, removeAnalytics } from '../cookies.js'

const cookieNamePolicy = config.get('cookie.namePolicy')
const cookiePolicy = config.get('cookiePolicy')

export const cookies = {
  plugin: {
    name: 'cookies',
    register: (server, _) => {
      server.state(cookieNamePolicy, cookiePolicy)

      server.ext('onPreResponse', (request, h) => {
        const statusCode = request.response.statusCode

        if (
          request.response.variety === 'view' &&
          statusCode !== 403 &&
          statusCode !== 404 &&
          statusCode !== 500 &&
          request.response.source.manager._context
        ) {
          const cookiesPolicy = getCurrentPolicy(request, h)

          request.response.source.manager._context.cookiesPolicy = cookiePolicy

          if ((!cookiesPolicy.analytics)) {
            removeAnalytics(request, h)
          }
        }

        return h.continue
      })
    }
  }
}
