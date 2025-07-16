import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      clean: false,
      reporter: ['text', 'lcov'],
      include: ['src/**'],
      exclude: [
        ...configDefaults.exclude,
        '**/test/**',
        'coverage',
        '.public',
        'postcss.config.js',
        'stylelint.config.js'
      ]
    },
    setupFiles: ['.vite/setup-files.js']
  }
})
