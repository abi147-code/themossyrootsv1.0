# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TMR CRM (The Mossy Roots) is a Dockerised SaaS CRM monorepo with invoicing, email marketing, campaign tracking, and workflow automation. All services live under `tmr/services/`.

## Architecture

**Monorepo with 4 microservices** orchestrated by Docker Compose (`tmr/docker-compose.yml`), fronted by an NGINX reverse proxy:

| Service | Path | Tech | Port |
|---------|------|------|------|
| `web` | `tmr/services/web/` | Next.js 15, React 19, TypeScript, Tailwind v4 | 3000 |
| `api` | `tmr/services/api/` | Express (CommonJS), Prisma ORM, PostgreSQL | 4000 |
| `invoice-api` | `tmr/services/invoice-api/` | Flask, ReportLab (Python) | 5000 |
| `n8n` | `tmr/services/n8n/` | n8n workflow engine | 5680 |

**NGINX proxy** routes: `/` → web, `/api/` → api, `/invoice/` → invoice-api, `/uploads/` → static files, `/n8n/` → n8n, `/invoice-generator/` → Vite static build.

## Common Commands

All commands run from `tmr/` unless noted otherwise.

```bash
# Full stack (local dev)
docker compose up --build          # Start everything → http://localhost
docker compose down                # Stop stack
docker compose down -v             # Stop + remove DB/n8n volumes

# Individual service rebuild
docker compose up --build web      # Rebuild just the frontend
docker compose up --build api      # Rebuild just the API
docker compose restart api         # Restart API after .env changes

# Frontend only (from tmr/services/web/)
npm run dev                        # Next.js dev server on :3000
npm run build                      # Production build (runs normalize-text + check-utf8 prebuild)
npm run lint                       # ESLint

# API only (from tmr/services/api/)
npm run dev                        # nodemon dev server on :4000
npm start                          # Production start

# Database (from tmr/services/api/)
npx prisma migrate deploy          # Apply migrations (auto-runs on container start)
npx prisma migrate dev             # Create new migration
npx prisma studio                  # Visual DB browser
```

## Key Architectural Decisions

### Authentication
- JWT-based, 7-day expiry. Token stored in `localStorage` as `tmr-token`.
- `AuthContext` (`web/src/context/AuthContext.tsx`) hydrates user profile on page load via `/api/users/me`.
- API middleware at `api/src/middleware/auth.js` validates Bearer tokens and attaches `req.user`.
- Roles: `USER` | `ADMIN` (Prisma enum). Admin user auto-seeded on first boot from `ADMIN_*` env vars.

### API Layer
- Frontend uses `apiFetch()` from `web/src/lib/api.ts` — a thin wrapper around `fetch()` that resolves `NEXT_PUBLIC_API_URL`.
- `resolveAssetUrl()` from the same file normalizes uploaded asset paths to full API URLs.
- Express API attaches Prisma client to every request as `req.prisma` via middleware.

### Database
- PostgreSQL 15 with Prisma ORM. Schema at `api/prisma/schema.prisma`.
- Key models: `User`, `Organization`, `Subscription`, `Customer`, `Invoice`, `EmailCampaign`, `Campaign`, `BrandSettings`, `InvoiceHistory`.
- Multi-tenant via `Organization` — users belong to an org, and most resources are scoped to `userId`.

### Email System
- Configurable via `EMAIL_SERVICE` env var: `mailpit` (local dev, UI at `:8025`) or `smtp`/`gmail` (production).
- Invoice logos and campaign banners use CID inline attachments for Gmail compatibility.
- Templates in `api/src/email/`.

### Frontend Patterns
- Next.js App Router with `[locale]` dynamic route segment for i18n.
- Path alias: `@/*` → `./src/*`.
- Tailwind v4 with custom Jaleo theme (stone, black, gold, olive). Fonts: Cormorant Garamond (serif), Montserrat (sans).
- 3D/animation: Three.js via React Three Fiber, Framer Motion, GSAP, Lenis smooth scroll.
- ESLint and TypeScript errors are ignored during builds (`next.config.ts`).

### API Route Structure
All Express routes mount under `/api/`:
- `/api/auth/*` — public (signup, login)
- `/api/users/*`, `/api/invoice/*`, `/api/email/*`, `/api/social/*`, `/api/history/*` — auth required
- `/api/campaigns/*` — mixed (tracking endpoints public, management auth-required)
- `/api/admin/*` — auth required (admin role checked in handlers)
- `/api/account/*`, `/api/brand/*`, `/api/billing/*` — specialized endpoints

### Billing
- Stripe integration exists but is **disabled by default** (`BILLING_ENABLED=false`). Stripe webhook route gets raw body parsing only when enabled.
- Trial system: 14-day default (`TRIAL_DAYS` env var).

## Environment Setup

Copy `tmr/.env.example` to `tmr/.env`. Key variables:
- `DATABASE_URL` — constructed from `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `JWT_SECRET` — required for auth
- `NEXT_PUBLIC_API_URL` — frontend → API communication
- `NEXT_PUBLIC_INVOICE_API_URL` — frontend → Flask invoice service
- `EMAIL_SERVICE` — `mailpit` | `smtp` | `gmail`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — auto-seeded admin account
- `GEMINI_API_KEY` — Google Gemini AI integration

## No Test Suite

There is currently no automated testing infrastructure (no Jest, Vitest, Playwright, or similar).
