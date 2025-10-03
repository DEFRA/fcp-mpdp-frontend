import convict from 'convict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import convictFormatWithValidator from 'convict-format-with-validator'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const oneWeekMs = 604800000

const isProduction = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'
const isDevelopment = process.env.NODE_ENV === 'development'

convict.addFormats(convictFormatWithValidator)

export const config = convict({
  serviceVersion: {
    doc: 'The service version, this variable is injected into your docker container in CDP environments',
    format: String,
    nullable: true,
    default: null,
    env: 'SERVICE_VERSION'
  },
  host: {
    doc: 'The IP address to bind',
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'HOST'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT'
  },
  staticCacheTimeout: {
    doc: 'Static cache timeout in milliseconds',
    format: Number,
    default: oneWeekMs,
    env: 'STATIC_CACHE_TIMEOUT'
  },
  serviceName: {
    doc: 'Applications Service Name',
    format: String,
    default: 'Find farm and land payment data'
  },
  root: {
    doc: 'Project root',
    format: String,
    default: path.resolve(dirname, '../..')
  },
  assetPath: {
    doc: 'Asset path',
    format: String,
    default: '/public',
    env: 'ASSET_PATH'
  },
  isProduction: {
    doc: 'If this application running in the production environment',
    format: Boolean,
    default: isProduction
  },
  isDevelopment: {
    doc: 'If this application running in the development environment',
    format: Boolean,
    default: isDevelopment
  },
  isTest: {
    doc: 'If this application running in the test environment',
    format: Boolean,
    default: isTest
  },
  log: {
    enabled: {
      doc: 'Is logging enabled',
      format: Boolean,
      default: process.env.NODE_ENV !== 'test',
      env: 'LOG_ENABLED'
    },
    level: {
      doc: 'Logging level',
      format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
      default: 'info',
      env: 'LOG_LEVEL'
    },
    format: {
      doc: 'Format to output logs in.',
      format: ['ecs', 'pino-pretty'],
      default: isProduction ? 'ecs' : 'pino-pretty',
      env: 'LOG_FORMAT'
    },
    redact: {
      doc: 'Log paths to redact',
      format: Array,
      default: isProduction
        ? ['req.headers.authorization', 'req.headers.cookie', 'res.headers']
        : []
    }
  },
  httpProxy: {
    doc: 'HTTP Proxy',
    format: String,
    nullable: true,
    default: null,
    env: 'HTTP_PROXY'
  },
  isSecureContextEnabled: {
    doc: 'Enable Secure Context',
    format: Boolean,
    default: isProduction,
    env: 'ENABLE_SECURE_CONTEXT'
  },
  isMetricsEnabled: {
    doc: 'Enable metrics reporting',
    format: Boolean,
    default: isProduction,
    env: 'ENABLE_METRICS'
  },
  nunjucks: {
    watch: {
      doc: 'Reload templates when they are changed.',
      format: Boolean,
      default: isDevelopment
    },
    noCache: {
      doc: 'Use a cache and recompile templates each time',
      format: Boolean,
      default: isDevelopment
    }
  },
  tracing: {
    header: {
      doc: 'Which header to track',
      format: String,
      default: 'x-cdp-request-id',
      env: 'TRACING_HEADER'
    }
  },
  backend: {
    endpoint: {
      doc: 'Endpoint for fcp-mpdp-backend',
      format: String,
      default: null,
      env: 'MPDP_BACKEND_ENDPOINT'
    },
    path: {
      doc: 'Path for fcp-mpdp-backend endpoint',
      format: String,
      default: '/v1/payments',
      env: 'MPDP_BACKEND_PATH'
    }
  },
  search: {
    limit: {
      doc: 'Maximum number of search results that can be shown on the results page',
      format: 'nat',
      default: 20
    }
  },
  cookie: {
    name: {
      doc: 'Name of cookie set as part of cookie policy',
      format: String,
      default: 'fcp_mpdp_cookie_policy',
    },
    policy: {
      clearInvalid: {
        doc: 'Clear invalid cookie policy',
        format: Boolean,
        default: true
      },
      encoding: {
        doc: 'Encoding protocol for cookie policy',
        format: String,
        default: 'base64json'
      },
      isSameSite: {
        doc: 'Check if site is the same',
        format: String,
        default: 'Lax'
      },
      isSecure: {
        doc: 'Check if secure',
        format: Boolean,
        default: isProduction
      }
    },
    config: {
      ttl: {
        doc: 'Time to live for cookie policy (ms)',
        format: 'nat',
        default: 1000 * 60 * 60 * 24 * 365
      }
    }
  },
  googleAnalyticsTagManagerKey: {
    doc: 'Tag manager key for Google Analytics',
    format: String,
    env: 'GOOGLE_ANALYTICS_TAG_MANAGER_KEY'
  }
})

config.validate({ allowed: 'strict' })
