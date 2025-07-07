import { serviceStartController } from './controller.js'

export const serviceStart = {
  plugin: {
    name: 'home',
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
