import inert from '@hapi/inert'
import { health } from '../routes/health.js'
import { start } from '../routes/start.js'
import { helloWorld } from '../routes/hello-world.js'
import { serveStaticFiles } from '../common/helpers/serve-static-files.js'

export const router = {
  plugin: {
    name: 'router',
    async register (server) {
      await server.register([inert])
      await server.route(health)
      await server.route(start)
      await server.route(helloWorld)
      await server.register([serveStaticFiles])
    }
  }
}
