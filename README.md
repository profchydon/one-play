# ArenaCampaign – Brand Tournament Platform MVP

Monolith MVP for brand-sponsored esports tournament campaigns. Built with Next.js 14, TypeScript, Prisma, PostgreSQL, and Redis, run via Docker.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Prisma** + PostgreSQL 16
- **Auth.js (NextAuth)** with credentials (email/password)
- **Redis** for rate limiting and caching
- **Docker Compose** for Postgres, Redis, and app

## Quick start

### 1. Environment

```bash
cp .env.example .env
```

Edit `.env`: set `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`).

### 2. Database (local dev without Docker)

If you run Postgres and Redis locally:

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register a user and choose **Brand / Tournament organizer** to create campaigns.

### 3. Docker (full stack)

From project root:

```bash
docker compose -f docker/docker-compose.yml up -d postgres redis
```

Then set in `.env`:

- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/onevoneplay`
- `REDIS_URL=redis://localhost:6379`

Run migrations and dev server:

```bash
npx prisma db push
npm run dev
```

To run the app in Docker too:

```bash
docker compose -f docker/docker-compose.yml up --build
```

App will be at [http://localhost:3000](http://localhost:3000).

## Features (MVP)

- **Brand admins:** Sign up, create campaigns (name, game, format, dates, branding), publish, close registration, generate bracket, view registrations/leads, export CSV, view bracket and analytics.
- **Public campaign page:** `/c/[slug]` – branded page with registration form (when registration is open).
- **Bracket:** Single elimination (and double elimination structure), match reporting (player reports winner, opponent confirms; admin can set winner).
- **Leaderboard:** Rankings by wins/losses.
- **Analytics:** Registrations over time, matches played, top countries.

## Scripts

- `npm run dev` – development server
- `npm run build` – production build
- `npm run start` – run production build
- `npx prisma db push` – sync schema to DB (no migrations)
- `npx prisma migrate dev` – create and run migrations
- `npx prisma studio` – open Prisma Studio

## Project layout

- `src/app/(auth)/` – login, register
- `src/app/(dashboard)/` – brand dashboard (campaigns, bracket, registrations, analytics)
- `src/app/(public)/c/[slug]/` – public campaign, bracket, leaderboard
- `src/app/api/` – route handlers (auth, campaigns, register, matches)
- `src/server/services/` – bracket generation, match advancement
- `prisma/schema.prisma` – data model
- `docker/` – Dockerfile and docker-compose
