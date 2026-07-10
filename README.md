# fcp-mpdp-frontend

![Build](https://github.com/defra/fcp-mpdp-frontend/actions/workflows/publish.yml/badge.svg)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-mpdp-frontend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-mpdp-frontend)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-mpdp-frontend&metric=bugs)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-mpdp-frontend)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-mpdp-frontend&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-mpdp-frontend)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-mpdp-frontend&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-mpdp-frontend)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-mpdp-frontend&metric=coverage)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-mpdp-frontend)
[![Dependabot](https://badgen.net/github/dependabot/DEFRA/fcp-mpdp-frontend)](https://github.com/DEFRA/fcp-mpdp-frontend/security/dependabot)

Frontend service for the Making Payment Data Public (MPDP) service.

MPDP is part of the Farming and Countryside Programme (FCP).

## Requirements

### Node.js

Node.js 24 or later is required. Use [nvm](https://github.com/nvm-sh/nvm) to manage versions:

```bash
nvm use
```

> The correct version is pinned in [.nvmrc](./.nvmrc).

### Docker

Docker is required to build the production image. For host-native development, only Node.js is required.

Docker can be installed from [Docker's official website](https://docs.docker.com/get-docker/).

## Local Development

### Setup

Install application dependencies:

```bash
nvm use
npm install
```

Copy the example environment file and fill in any values for your machine:

```bash
cp .env.example .env
```

### Development

Run locally with hot reload:

```bash
npm run dev
```

Or use the shorthand alias (equivalent to `npm run dev`):

```bash
npm run local
```

The app reads `MPDP_BACKEND_ENDPOINT` from your `.env` (default `http://localhost:3001`).
To run against a live backend, start it first — see [fcp-mpdp-core](../fcp-mpdp-core).

To run the full system together inside Docker (e.g. for journey tests), use:

```bash
npm run docker:build  # build the image
npm run docker:dev    # run inside Docker on the fcp-mpdp network
```

### Testing

Run all tests (unit + integration) with coverage:

```bash
npm test
```

Run only unit tests (fast, no containers needed):

```bash
npm run test:unit
```

Run in watch mode for TDD:

```bash
npm run test:watch
```

### Debugging

VS Code launch configurations are in [.vscode/launch.json](./.vscode/launch.json).

- **Dev: run server** — launches the server locally with the inspector attached. Set breakpoints and hit F5.
- **Debug current test** — opens the inspector on the currently active test file. Open a test file and hit F5.

### npm scripts

All available npm scripts can be seen in [package.json](./package.json)
To view them in your command line:

```bash
npm run
```

### Update dependencies

To update dependencies use [npm-check-updates](https://github.com/raineorshine/npm-check-updates):

> The following script is a good start. Check out all the options on
> the [npm-check-updates](https://github.com/raineorshine/npm-check-updates)

```bash
ncu --interactive --format group
```

## Service-to-service authentication

This service optionally attaches a short-lived JWT to every outbound request to the backend API. This is disabled by default and intended to be enabled in deployed environments when the backend has `SERVICE_AUTH_ENABLED=true`.

When enabled, the service obtains a JWT from the AWS STS `GetWebIdentityToken` API on startup, caches it in memory, and refreshes it automatically before it expires. The token is attached as a `Bearer` header on all backend requests.

The AWS SDK reads the `AWS_ROLE_ARN` and `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` environment variables automatically - these are injected by ECS and do not need to be set manually.

## Environment variables

All variables are configured in `.env` for local development (see `.env.example`).

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Node environment |
| `MPDP_BACKEND_ENDPOINT` | `http://localhost:3001` | Backend API URL |
| `AWS_EMF_ENVIRONMENT` | `Local` | Prevents metrics from connecting to CloudWatch EMF agent locally |
| `SERVICE_AUTH_ENABLED` | `false` | Enable service-to-service JWT on outbound backend requests |
| `SERVICE_AUTH_AUDIENCE` | `fcp-mpdp-backend` | JWT audience sent in the token request |
| `SERVICE_AUTH_TOKEN_DURATION` | `300` | Token lifetime in seconds (max 900) |

## SonarQube Cloud

Instructions for setting up SonarQube Cloud can be found in [sonar-project.properties](./sonar-project.properties).

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
