# OS Detector

A small demo app showing how much a web server and a browser script can learn about a visiting device — no permissions requested, no cookies dropped. Built with Next.js (App Router), TypeScript, and Tailwind CSS.

The page shows three blocks:

1. **Operating System** — detected twice and compared: once on the server from the `User-Agent` header, once in the browser via the Client Hints API / UA string.
2. **Browser Configuration** — timezone, language(s), screen/viewport geometry, pixel ratio, CPU cores, device memory, cookies, Do Not Track, color scheme, and more, all read client-side.
3. **Network** — IP address, ISP/organization, ASN, and approximate location, resolved server-side via a `/api/network` route.

## Requirements

- Node.js **24.x** (matches the version used in the Docker image)
- npm (ships with Node)

No database, no API keys, no signup required — the network lookup uses the free [ipapi.co](https://ipapi.co) endpoint.

## Option A — Run directly on the host

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a production-style run:

```bash
npm install
npm run build
npm run start
```

Other scripts:

```bash
npm run lint    # ESLint (flat config)
```

## Option B — Run with Docker

No local Node.js installation needed — only Docker.

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). Stop it with:

```bash
docker compose down
```

This builds a small multi-stage image (`node:24-alpine`, Next.js `standalone` output) defined in [Dockerfile](Dockerfile) and run via [docker-compose.yml](docker-compose.yml), exposing port `3000`.

To rebuild after changing dependencies or source:

```bash
docker compose build
docker compose up -d
```

## A note on the Network block

The `/api/network` route trusts `X-Forwarded-For` / `X-Real-IP` headers to find the visitor's real IP. If you run `docker compose up` directly (port mapped straight to the host, no reverse proxy in front), there's no such header, so it falls back to the container's own outbound IP — the "Source" field in the UI tells you which case you're in. Put a reverse proxy (nginx, Traefik, a cloud load balancer) in front and forward those headers to see the real visitor's network info.

The lookup service (ipapi.co) is free and rate-limited; if it throttles or fails, the card shows an inline error instead of breaking the page.
