import inert from '@hapi/inert'

import { health } from './health/index.js'
import { start } from './start/index.js'
import { serveStaticFiles } from './common/helpers/serve-static-files.js'

export const router = {
  plugin: {
    name: 'router',
    async register(server) {
      await server.register([inert])
      await server.register([health])
      await server.register([start])
      await server.register([serveStaticFiles])
    }
  }
}
