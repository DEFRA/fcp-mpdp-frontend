import inert from '@hapi/inert'
import { health } from './health/index.js'
import { serviceStart } from './service-start/index.js'
import { about } from './about/index.js'
import { serveStaticFiles } from './common/helpers/serve-static-files.js'

export const router = {
  plugin: {
    name: 'router',
    async register(server) {
      await server.register([inert])
      await server.register([health])
      await server.register([serviceStart, about])
      await server.register([serveStaticFiles])
    }
  }
}
