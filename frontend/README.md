# Network Monitor Frontend

React dashboard for the Network Device Monitoring Service.

## Features

- View registered network devices and live health state
- Register new devices
- Submit simulated device telemetry
- Inspect recent status history per device
- Export the inventory table as CSV

## Stack

- React 19
- Vite 8
- TypeScript
- MUI
- TanStack Query
- React Hook Form + Zod

## Configuration

The app reads the API base URL from `VITE_API_URL`.

```bash
VITE_API_URL=http://localhost:8000/api
```

If unset, it defaults to:

```text
http://localhost:8000/api
```

## Development

```bash
pnpm install
pnpm dev
```

The dev server runs at:

```text
http://localhost:5173
```

## Checks

```bash
pnpm exec tsc -b
pnpm lint
```

## Production Build

```bash
pnpm build
```

Vite 8 requires Node.js `20.19+` or `22.12+`. Node `21.x` is not supported.

## Docker

The frontend Docker image builds the static app and serves it with Nginx. In the monorepo, use:

```bash
docker-compose up --build
```
