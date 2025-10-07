import Blankie from 'blankie'

// Hash 'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw=' is to support a GOV.UK frontend script bundled within Nunjucks macros
// https://frontend.design-system.service.gov.uk/import-javascript/#if-our-inline-javascript-snippet-is-blocked-by-a-content-security-policy

const googleTagManagerUrl = 'https://*.googletagmanager.com'

export const contentSecurityPolicy = {
  plugin: Blankie,
  options: {
    fontSrc: ['self'],
    imgSrc: [
      'self',
      googleTagManagerUrl,
      'https://*.google-analytics.com',
      'https://*.g.doubleclick.net',
      'https://*.google.com',
      'https://*.google.co.uk'
    ],
    scriptSrc: ['self', "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='", googleTagManagerUrl],
    styleSrc: ['self'],
    connectSrc: [
      'self',
      googleTagManagerUrl,
      'https://*.google-analytics.com',
      'https://*.analytics.google.com',
      'https://*.g.doubleclick.net',
      'https://*.google.com',
      'https://*.google.co.uk',
      'https://pagead2.googlesyndication.com'
    ],
    frameSrc: [googleTagManagerUrl],
    frameAncestors: ['self'],
    formAction: ['self'],
    manifestSrc: ['self'],
    generateNonces: true
  }
}
