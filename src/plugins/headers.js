export const headers = {
  plugin: {
    name: 'headers',
    register: (server, _options) => {
      server.ext('onPreResponse', (request, h) => {
        const response = request.response

        const headers = response.headers || response.output?.headers

        if (headers) {
          headers['X-Robots-Tag'] = 'noindex, nofollow'
          headers['Cross-Origin-Opener-Policy'] = 'same-origin'
          headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
          headers['Cross-Origin-Resource-Policy'] = 'same-site'
          headers['Referrer-Policy'] = 'no-referrer'
          headers['Permissions-Policy'] = 'camera=(), geolocation=(), magnetometer=(), microphone=(), payment=(), usb=()'
        }

        return h.continue
      })
    }
  }
}
