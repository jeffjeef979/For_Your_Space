---
id: deployment
title: Deployment Guide
sidebar_position: 5
---

# Deployment Guide

Find your Space is designed to deploy as a single Node.js process on Cloud Run or any container-based hosting platform.

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 22+ |
| pnpm | 10+ |
| MySQL/TiDB | 8.0+ |

## Environment Variables

The following environment variables must be configured:

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | MySQL connection string | Yes |
| `JWT_SECRET` | Session cookie signing secret | Yes |
| `VITE_APP_ID` | Manus OAuth application ID | Yes |
| `OAUTH_SERVER_URL` | Manus OAuth backend URL | Yes |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL | Yes |
| `BUILT_IN_FORGE_API_URL` | LLM and services API URL | Yes |
| `BUILT_IN_FORGE_API_KEY` | API key for backend services | Yes |
| `WHATSAPP_TOKEN` | WhatsApp Cloud API token | Optional |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp business phone ID | Optional |
| `ORGANIZER_PHONE` | Organizer's WhatsApp number | Optional |

## Build & Run

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Build for production
pnpm build

# Start production server
pnpm start
```

## Single Shell Script

A convenience script is provided that handles the entire setup:

```bash
chmod +x setup-and-run.sh
./setup-and-run.sh
```

This script:
1. Installs all dependencies
2. Pushes database migrations
3. Runs the test suite
4. Starts the development server

## Production Deployment

### Manus Hosting (Recommended)

The simplest deployment path:
1. Save a checkpoint in the Manus IDE
2. Click the "Publish" button in the Management UI
3. Configure a custom domain in Settings → Domains

### Docker

```dockerfile
FROM node:22-slim
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Cloud Run

The app is Cloud Run-compatible out of the box:
- Single process, stateless
- Port configured via `PORT` env var
- Cold start optimized (< 3s)
- 512 MiB RAM sufficient

## Database Setup

The application uses Drizzle ORM with MySQL. Schema changes are managed via:

```bash
# Generate and apply migrations
pnpm db:push
```

Tables created:
- `users` — Authentication and role management
- `events` — Event configuration and venue details
- `attendees` — Registration and check-in records
- `checkIns` — Arrival timestamps and geolocation
- `voiceRequests` — Voice command logs and responses
- `wifiConfigs` — WiFi credentials per event

## Health Check

The server responds to `GET /` with the frontend application. For infrastructure health checks, use:

```
GET /api/trpc/system.health
```
