# LuxeVerse Deployment Guide

This guide prepares LuxeVerse for deployment without selecting a hosting provider or changing application features. It assumes a separately managed PostgreSQL database, a backend service that can run Node.js or the backend Docker image, and a static frontend host.

## Production Topology

### Same-site deployment

```text
Frontend: https://luxeverse.com
Backend:  https://api.luxeverse.com
```

These origins share the same site. `COOKIE_SAME_SITE=lax` may work when the browser and final routing topology support it. Keep `secure=true` through `NODE_ENV=production`.

### Cross-site deployment

```text
Frontend: https://luxeverse.vercel.app
Backend:  https://luxeverse-api.onrender.com
```

Cross-site cookie authentication may require:

- `COOKIE_SAME_SITE=none`
- HTTPS, which makes the production cookie `secure=true`
- `credentials: true` in CORS and frontend fetches
- Configured frontend origins in `FRONTEND_URL`
- CSRF protection review before production use

Do not use `COOKIE_SAME_SITE=none` for local HTTP development. No cookie domain is configured by default; host-only cookies are the safest default. Add a cookie domain only if the final subdomain architecture specifically requires it.

## Environment Configuration

### Backend runtime variables

Configure these on the backend service. They are read when the server starts:

```text
NODE_ENV=production
PORT=<hosting-provider-port-or-3000>
DATABASE_URL=<managed-postgresql-connection-string>
JWT_ACCESS_SECRET=<long-random-secret>
JWT_REFRESH_SECRET=<different-long-random-secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://luxeverse.com,https://www.luxeverse.com
TRUST_PROXY=1
COOKIE_SAME_SITE=lax
CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
```

`DATABASE_URL` must be supplied by the selected PostgreSQL provider. It may be an SSL-enabled managed PostgreSQL URL; no host, username, password, or database is hardcoded in application source.

`TRUST_PROXY=1` is appropriate when exactly one known reverse proxy or hosting ingress sits in front of the backend. Keep it at `0` for direct local development. Do not use unrestricted proxy trust.

Cloudinary values are backend-only. Never place `CLOUDINARY_API_SECRET` in frontend variables or expose it to the browser.

### Frontend build variables

Configure these before building the frontend:

```text
VITE_API_URL=https://api.luxeverse.com/api
VITE_SITE_URL=https://luxeverse.com
```

Vite variables are baked into the static build. Changing `VITE_API_URL` or `VITE_SITE_URL` requires a new frontend build and redeployment. Backend variables remain runtime configuration.

## Deployment Sequence

### Database

1. Create a managed PostgreSQL database.
2. Copy its connection string into backend `DATABASE_URL`.
3. Configure all backend runtime variables.
4. Generate the Prisma client and apply existing migrations:

```powershell
cd backend
npm ci
npx prisma generate
npx prisma migrate deploy
```

`prisma migrate deploy` is the production command. Do not use `prisma migrate dev` against production data.

### Backend

1. Install dependencies with `npm ci`.
2. Run `npx prisma generate`.
3. Run `npm run build`.
4. Start the compiled server with `npm run start`.
5. Configure the hosting health check as `GET /health`.

The backend start command is:

```text
npm run start
```

It runs `node dist/server.js`, not `tsx` or `ts-node`.

The backend Docker image is also production-oriented:

```powershell
cd backend
docker build -t luxeverse-backend .
docker run --env-file .env -p 3000:3000 luxeverse-backend
```

Do not bake `.env` files or secrets into the image.

### Frontend

1. Configure `VITE_API_URL` and `VITE_SITE_URL`.
2. Run `npm ci`.
3. Run `npm run build`.
4. Deploy the generated `frontend/dist/` directory to a static host.

No custom frontend server is required for the production build. Configure the static host to serve `index.html` for client-side routes if its platform requires an SPA fallback rule.

## Health Check

`GET /health` is unauthenticated and intentionally lightweight:

```json
{
  "success": true,
  "status": "ok"
}
```

It does not expose credentials or database details. Use it as the hosting provider health endpoint.

## SEO Production Checklist

The frontend uses `VITE_SITE_URL` for canonical URLs, Open Graph URLs, sitemap URLs, and structured data. Set the production value before running `npm run build`.

The build generates:

- `frontend/dist/sitemap.xml`
- `frontend/dist/robots.txt`
- Canonical and social metadata through the SPA runtime

The sitemap is generated at build time. Public content available when the build runs is included. Content added later requires another frontend build to enter the static sitemap. A future backend-driven `/sitemap.xml` endpoint could remove that rebuild requirement, but is not part of this preparation pass.

## Local Docker Versus Production

The root `docker-compose.yml` is for local PostgreSQL development. It uses local credentials and publishes PostgreSQL on port `5432`; do not treat it as a production database architecture.

Production should use managed PostgreSQL or an independently secured database service, injected credentials, private networking where available, and backups appropriate to the selected provider.

The frontend Dockerfile remains a development convenience. Production frontend deployment should use the Vite `dist/` output unless a chosen host specifically requires a container.

## Post-deployment Checks

1. Request `/health` and confirm HTTP 200.
2. Test CORS from each configured frontend origin.
3. Test login, refresh, and logout.
4. Confirm cookie behavior for the selected same-site or cross-site topology.
5. Confirm a `USER` cannot access admin routes.
6. Test admin content, category, tag, image, and video operations.
7. Test Cloudinary media delivery and cleanup.
8. Open canonical, Open Graph, robots, and sitemap URLs.
9. Confirm frontend routes work on direct navigation and refresh.
10. Review logs and rate-limit responses.

## Provider-Neutral Options

No provider has been selected or configured. Reasonable architectures to evaluate, subject to current pricing, regional availability, and platform behavior, include:

- Static frontend host plus a Node service and managed PostgreSQL.
- Vercel or Cloudflare Pages for the frontend plus Render, Railway, Fly.io, or an equivalent Node host and managed PostgreSQL.
- A single VPS or container platform running the backend image, with a separate static frontend host and managed PostgreSQL.

Verify current pricing, build settings, persistent storage, reverse-proxy behavior, cookie support, and PostgreSQL networking before choosing an option.
