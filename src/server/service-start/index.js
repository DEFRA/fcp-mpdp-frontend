import { serviceStartController } from './controller.js'

export const serviceStart = {
  plugin: {
    name: 'service-start',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/',
          ...serviceStartController
        }
      ])
    }
  }
}
