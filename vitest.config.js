import { defineConfig, configDefaults } from 'vitest/config'

const coverageConfig = {
  provider: 'v8',
  reportsDirectory: './coverage',
  clean: false,
  reporter: ['text', 'lcov'],
  include: ['src/**/*.js'],
  exclude: [
    ...configDefaults.exclude,
    '**/test/**',
    'coverage',
    '.public',
    'postcss.config.js'
  ]
}

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    coverage: coverageConfig,
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.test.js'],
          clearMocks: true,
          environment: 'node',
          env: {
            NODE_ENV: 'test',
            MPDP_BACKEND_ENDPOINT: 'http://localhost:3001'
          }
        }
      },
      {
        test: {
          name: 'integration',
          include: ['test/integration/**/*.test.js'],
          clearMocks: true,
          environment: 'node',
          env: {
            NODE_ENV: 'test',
            MPDP_BACKEND_ENDPOINT: 'http://localhost:3001',
            GOOGLE_TAG_MANAGER_KEY: 'GTM-TEST'
          }
        }
      }
    ]
  }
})
