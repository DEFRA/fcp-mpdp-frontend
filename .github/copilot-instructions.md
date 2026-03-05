# FCP MPDP Frontend - AI Coding Agent Instructions

## Overview

Public-facing frontend for the Making Payment Data Public (MPDP) service. Server-side rendered Node.js application using Hapi.js with Nunjucks templates and client-side JavaScript bundled via Webpack.

## Architecture

### Service Communication
- Calls backend API via `MPDP_BACKEND_ENDPOINT` env var (default: `http://fcp-mpdp-backend:3001`)
- Part of 3-service architecture: frontend (public) → backend (API) → PostgreSQL
- Sibling service: [fcp-mpdp-admin](../fcp-mpdp-admin) (authenticated admin interface)

### Core Technology Stack
- **Runtime:** Node.js 22+ with ES modules (`"type": "module"`)
- **Framework:** Hapi.js 21 for HTTP server
- **Templates:** Nunjucks for server-side rendering
- **Bundling:** Webpack for client-side assets  
- **Testing:** Vitest with separate `test/unit` and `test/integration` directories
- **Linting:** Neostandard (modern ESLint config)
- **Config:** Convict for environment-based configuration

## Code Quality Standards

### Linting Requirements
**All code MUST pass neostandard linting before commit.**

Run linting:
```bash
npm run lint              # Check for errors
npm run lint:fix          # Auto-fix issues
```

**Common neostandard rules to follow:**
- ❌ No unused variables or imports
- ❌ No unnecessary whitespace or blank lines
- ✅ Use `const` for variables that don't change
- ✅ Consistent 2-space indentation
- ✅ Single quotes for strings (except when escaping)
- ✅ No semicolons (JavaScript ASI)
- ✅ Trailing commas in multiline objects/arrays

**When generating code:**
1. Follow existing code style in the file
2. Run linter after making changes
3. Fix all linting errors before completion
4. Never commit code with linting errors

## Standards & Guidelines

This service follows:
- **[GOV.UK Service Standard](https://www.gov.uk/service-manual/service-standard)** - Best practices for building government services
- **[GOV.UK Design System](https://design-system.service.gov.uk/)** - Design patterns, components, and styles
- **[DEFRA Software Development Standards](https://defra.github.io/software-development-standards/)** - Team coding standards and practices
- **[WCAG 2.2](https://www.w3.org/TR/WCAG22/)** - Web accessibility guidelines (Level AA minimum)

## Project Structure

```
src/
  server.js         # Hapi server setup, plugin registration, security config
  index.js          # Entry point
  config/           # Convict configuration schemas
  plugins/          # Hapi plugins (router, CSRF, cookies, CSP)
  routes/           # Route definitions (each exports {method, path, handler})
  views/            # Nunjucks templates
  services/         # External API calls (backend integration)
  api/              # Internal API helpers
  common/helpers/   # Utilities (logging, tracing, error handling)
  client/           # Client-side JavaScript
```

## Development Patterns

### Route Definition
Routes are exported as objects and registered via `src/plugins/router.js`:

```javascript
export const routeName = {
  method: 'GET',
  path: '/path',
  handler: async (request, h) => {
    return h.view('template-name', { data })
  }
}
```

### Configuration Access
Use Convict's `config.get()` for environment variables. See [src/config/config.js](../src/config/config.js):

```javascript
const backendUrl = config.get('mpdpBackend.endpoint')
```

### Hapi Plugins
Server capabilities are added via plugins in [src/server.js](../src/server.js). Key plugins:
- `router` - Route registration
- `crumb` - CSRF protection  
- `cookies` - Session management
- `contentSecurityPolicy` - CSP headers
- Request logging, tracing, secure context

## Development Workflow

### Local Development (Standalone)
```bash
npm install
npm run docker:build
npm run docker:dev           # Runs on port 3000
```

### Full System Development
Use [fcp-mpdp-core](../fcp-mpdp-core) orchestration scripts:
```bash
cd ../fcp-mpdp-core
./build                      # Build all services
./start                      # Start all services
./start -s                   # Start and seed database
```

### Testing
```bash
npm run docker:test          # Run all tests with coverage
npm run docker:test:watch    # TDD mode
```
- Tests in `test/unit/**/*.test.js` and `test/integration/**/*.test.js`
- Vitest config: [vitest.config.js](../vitest.config.js)
- Set `TZ=UTC` for time-based tests

### Debugging
```bash
npm run dev:debug            # Debugger listening on 0.0.0.0:9229
# Attach VS Code debugger or Chrome DevTools
```

## Component Integration

### Calling Backend API
Use services in [src/services](../src/services):
- Backend endpoints documented at `http://localhost:3001/swagger` when running
- Handle API errors appropriately (network, validation, server errors)

### Client-Side Assets
- Source: [src/client](../src/client) 
- Webpack bundles to `.public/` directory
- Served via `@hapi/inert` static file handler
- GOV.UK Frontend components used for styling

## Testing Guidelines

### Unit Tests
- Mock external dependencies (backend calls, config)
- Test route handlers, services, utilities in isolation
- Example: [test/unit](../test/unit)

### Integration Tests
- Test full request/response cycles
- Use Hapi's `server.inject()` for HTTP testing
- Mock backend API responses
- Example: [test/integration](../test/integration)

## CI/CD

### GitHub Actions
- [.github/workflows/publish.yml](../.github/workflows/publish.yml) - Main branch builds
- Runs `npm run docker:test` and SonarQube scan
- Deploys to CDP (Defra Cloud Platform) environments
- Node.js 22+ required in workflows

### Quality Gates
- ESLint (neostandard) must pass
- Test coverage reported to SonarQube Cloud
- All tests must pass before merge

## Common Tasks

### Adding a New Route
1. Create route file in `src/routes/` exporting route object
2. Add handler logic (call services, render view)
3. Register in [src/plugins/router.js](../src/plugins/router.js)
4. Add corresponding Nunjucks template in `src/views/`
5. Add tests in `test/unit/routes/` and `test/integration/`

### Adding Configuration
1. Add schema to [src/config/config.js](../src/config/config.js) using Convict
2. Document in README if user-facing
3. Update Docker compose files with default values

### Updating Dependencies
- Use `ncu --interactive --format group` (npm-check-updates)
- Test thoroughly after updates
- Watch for breaking changes in Hapi, Nunjucks, Webpack
