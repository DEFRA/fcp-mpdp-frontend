import { aboutController } from './controller.js'

export const about = {
  plugin: {
    name: 'about',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/about',
          ...aboutController
        }
      ])
    }
  }
}
