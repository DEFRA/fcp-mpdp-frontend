import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/test/**/*.test.js'],
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reportOnFailure: true,
      clean: false,
      reporter: ['lcov'],
      include: ['src/**/*.js'],
      exclude: [
        ...configDefaults.exclude,
        '.public',
        'coverage',
        'postcss.config.js',
        'stylelint.config.js',
        '**/node_modules/**',
        '**/test/**',
        '.server',
        'src/index.js'
      ]
    }
  }
})
