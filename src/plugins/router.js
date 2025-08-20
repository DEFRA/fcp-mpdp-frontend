import Inert from '@hapi/inert'
import { health } from '../routes/health.js'
import { start } from '../routes/start.js'
import { schemePaymentsByYear } from '../routes/scheme-payments-by-year.js'
import { serveStaticFiles } from '../common/helpers/serve-static-files.js'

export const router = {
  plugin: {
    name: 'router',
    async register (server) {
      await server.register([Inert])
      await server.route(health)
      await server.route(start)
      await server.route(schemePaymentsByYear)
      await server.register([serveStaticFiles])
    }
  }
}
