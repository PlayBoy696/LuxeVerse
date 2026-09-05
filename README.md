# LuxeVerse

LuxeVerse is a full-stack video platform for discovering, watching and managing films, videos and digital media. It is built with React, TypeScript, Express, PostgreSQL, Prisma, JWT authentication, RBAC, media uploads, comments, likes, favorites, watch history, admin CRUD, SEO, and security hardening.

## Features

- User registration, login, and logout
- JWT access and refresh authentication
- `USER` and `ADMIN` roles
- Admin dashboard
- Content CRUD
- Categories and tags
- Search, filtering, and pagination
- Likes
- Favorites
- Comments
- Watch history
- Image and video uploads
- Cloudinary media cleanup
- Responsive video player
- Responsive UI
- SEO metadata, sitemap, robots.txt, and structured data
- Security hardening, rate limiting, CORS, and Helmet

## Product Positioning

LuxeVerse supports legal media such as films, documentaries, educational videos, gaming content, technology videos, music, sports, and entertainment. Upload only developer-owned, royalty-free, public-domain, or properly licensed media.

Suggested fictional demo content:

- The Future of Artificial Intelligence
- Exploring Modern Game Development
- A Short Film: The Last Train
- Inside Modern Web Development
- Documentary: Life Beneath the Ocean
- Building a Full-Stack Application

Suggested categories include Movies, Short Films, Documentaries, Gaming, Technology, Entertainment, Education, Sports, and Music. These examples are documentation only; the application does not modify an existing local database automatically.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- react-helmet-async

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT
- bcryptjs
- Zod
- Multer
- Cloudinary
- Helmet
- express-rate-limit

### Infrastructure

- Docker
- PostgreSQL
- Git/GitHub

## Project Structure

```text
frontend/    React + TypeScript + Vite client application
backend/     Express + TypeScript API, Prisma schema, migrations, and services
docker-compose.yml
```

The frontend contains the public application, authentication views, admin dashboard, API clients, and SEO helpers. The backend contains the HTTP API, authentication and authorization middleware, domain services, repositories, validators, Prisma migrations, and upload routes.

## Getting Started

### Requirements

- Node.js 20 or newer
- npm
- Docker Desktop
- PostgreSQL, provided locally through Docker

### 1. Start PostgreSQL

From the repository root:

```powershell
docker compose up -d postgres
```

If the local container already exists, this also works:

```powershell
docker start luxeverse-postgres
```

The compose configuration exposes PostgreSQL on port `5432` for local development.

### 2. Configure and start the backend

PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
```

Review `.env` and provide real JWT and Cloudinary values before using authentication or uploads. Then install dependencies, generate the Prisma client, apply migrations, and start the API:

```powershell
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The API runs on `http://localhost:3000` by default.

For Command Prompt, use `copy .env.example .env` instead of `Copy-Item`.

### 3. Configure and start the frontend

In a second terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

## Environment Variables

Use the example files as the starting point. Never commit `.env` files or real secret values.

### Backend

- `DATABASE_URL`
- `PORT`
- `NODE_ENV`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `FRONTEND_URL`
- `TRUST_PROXY`
- `COOKIE_SAME_SITE`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

`FRONTEND_URL` accepts a comma-separated list of allowed browser origins. `TRUST_PROXY` should remain `0` unless the deployment uses a configured reverse proxy.
`COOKIE_SAME_SITE` defaults to `lax`; choose `none` only for an HTTPS cross-site deployment after reviewing CSRF protection.

### Frontend

- `VITE_API_URL`
- `VITE_SITE_URL`

## Database

LuxeVerse uses PostgreSQL through Prisma. Database schema changes are stored under `backend/prisma/migrations`.

Common commands:

```powershell
cd backend
npm run prisma:generate
npm run prisma:migrate
npx prisma migrate deploy
```

Use `npm run prisma:migrate` during local development to create or apply migrations. Production must use `npx prisma migrate deploy` (or `npm run prisma:deploy`) and must never reset production data. The backend build also checks the TypeScript source:

```powershell
npm run build
```

## API Overview

The backend API is mounted under `/api`:

- `/api/auth` - registration, login, refresh, logout, current-user, and admin access checks
- `/api/categories` - public category reads and admin CRUD
- `/api/tags` - public tag reads and admin CRUD
- `/api/contents` - public content reads and admin CRUD
- `/api/favorites` - authenticated user favorites
- `/api/likes` - public like counts and authenticated like actions
- `/api/comments` - public content comments and authenticated comment actions
- `/api/watch-history` - authenticated watch history
- `/api/uploads` - admin-only image and video uploads
- `/health` - lightweight service health response

## Security

The application includes:

- HttpOnly refresh-token cookies
- Hashed refresh tokens in the database
- Short-lived access tokens and separate JWT secrets
- bcrypt password hashing
- Backend-enforced RBAC and ownership checks
- Global, authentication, and upload rate limiting
- Allowlisted CORS origins
- Helmet security headers
- Zod input validation
- MIME and size limits for image and video uploads
- Sanitized production error responses

## Build

Backend:

```powershell
cd backend
npm run build
```

Frontend:

```powershell
cd frontend
npm run build
```

The frontend build also generates `public/sitemap.xml` from the public content endpoint. Configure `VITE_SITE_URL` for production canonical URLs and sitemap output.
The production frontend artifact is `frontend/dist/`. Vite environment variables are baked into this artifact, so changing `VITE_API_URL` or `VITE_SITE_URL` requires a rebuild.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the provider-neutral production sequence, environment topology, Docker workflow, health checks, SEO requirements, and remaining deployment decisions.

## Current Limitations / Production Notes

- Video uploads currently use Multer `memoryStorage()` with a 200 MB limit. Heavier production workloads should move to direct or streamed uploads.
- Cloudinary folders, retention, transformations, and access policy should be reviewed for production content.
- The sitemap is generated at build time and needs access to the public contents endpoint during the build.
- Production deployment requires real domains and production environment variables.
- Secure cookie `SameSite` behavior depends on the final frontend/backend deployment topology.
- The local Docker Compose file is intended for development; production PostgreSQL credentials and network exposure must be hardened.

## Screenshots

Screenshots can be added here when representative product captures are available.

## License

No license has been selected yet.
