import { startController } from './controller.js'

export const start = {
  plugin: {
    name: 'start',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/',
          ...startController
        }
      ])
    }
  }
}
