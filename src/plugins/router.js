import Inert from '@hapi/inert'
import { health } from '../routes/health.js'
import { start } from '../routes/start.js'
import { schemePaymentsByYear } from '../routes/scheme-payments-by-year.js'
import { search } from '../routes/search/search.js'
import { suggestions } from '../routes/search/suggestions.js'
import { accessibility } from '../routes/accessibility.js'
import { serveStaticFiles } from '../common/helpers/serve-static-files.js'

export const router = {
  plugin: {
    name: 'router',
    async register (server) {
      await server.register([Inert])
      await server.route(health)
      await server.route(start)
      await server.route(schemePaymentsByYear)
      await server.route(search)
      await server.route(suggestions)
      await server.route(accessibility)
      await server.register([serveStaticFiles])
    }
  }
}
