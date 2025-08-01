import path from 'path'
import hapi from '@hapi/hapi'
import { router } from './plugins/router.js'
import { config } from './config/config.js'
import { pulse } from './common/pulse.js'
import { catchAll } from './common/errors.js'
import { nunjucksConfig } from './config/nunjucks/nunjucks.js'
import { setupProxy } from './common/proxy/setup-proxy.js'
import { requestTracing } from './common/request-tracing.js'
import { requestLogger } from './common/logging/request-logger.js'
import { secureContext } from './common/secure-context/secure-context.js'

export async function createServer () {
  setupProxy()
  const server = hapi.server({
    host: config.get('host'),
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      },
      files: {
        relativeTo: path.resolve(config.get('root'), '.public')
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false
        },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      }
    },
    router: {
      stripTrailingSlash: true
    },
    state: {
      strictHeader: false
    }
  })
  await server.register([
    requestLogger,
    requestTracing,
    secureContext,
    pulse,
    nunjucksConfig,
    router
  ])

  server.ext('onPreResponse', catchAll)

  return server
}
