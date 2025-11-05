# TMR CRM Monorepo

The Mossy Roots (TMR) is a Dockerised SaaS CRM starter that bundles authentication, billing, and marketing automations into a single monorepo. Spin up the full stack locally with one command and begin integrating your own workflows.

## Stack

- **Frontend:** Next.js 15 + Tailwind (App Router) living in `services/web`
- **Backend API:** Node.js + Express + Prisma, JWT auth, Stripe billing hooks in `services/api`
- **Database:** PostgreSQL 15 (containerised)
- **Invoice microservice:** Flask app in `services/invoice-api`
- **Automations:** n8n workflow engine
- **Email testing:** Mailpit SMTP + web UI
- **Reverse proxy:** NGINX container exposing `http://localhost`

## Quick start

1. Copy the example environment variables and update secrets as needed:

   ```bash
   cd tmr
   cp .env.example .env
   ```

2. Launch the entire platform:

   ```bash
   docker compose up --build
   ```

3. Visit `http://localhost` for the web app, then create an account to start your 14-day trial. Supporting UIs are available at:

   - Mailpit: `http://localhost:8025`
   - n8n: `http://localhost/n8n`
   - API health: `http://localhost/api/health`

The proxy forwards `/api` to the Node API, `/invoice` to the Flask service, and `/n8n` to the workflow UI.

> **Render deployment:** Local `.env` values can keep `http://localhost` origins, but Render must use the HTTPS service URLs shown in `.env.example` (e.g. `https://tmr-api.onrender.com`, `https://tmr-invoice.onrender.com`, `https://tmr-web.onrender.com`). Configure `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_INVOICE_API_URL`, `API_PUBLIC_URL`, `INVOICE_API_URL`, and `CORS_ORIGIN` with those Render domains so the frontend, API, and Flask service communicate correctly. The Next.js build should read these from runtime env vars rather than baked-in Docker build args.

Render persistent disk: `/app/uploads` (API service)

## Email setup

- Copy `.env.example` to `.env` in the repository root. Docker Compose mounts that file into the API service (`env_file: .env`), so restart the container after any changes (`docker compose up --build` or `docker compose restart api`).
- Mailpit stays the default SMTP gateway for local work. Keep `EMAIL_SERVICE=mailpit` in `.env` and browse `http://localhost:8025` for captured messages.
- To send live messages through Gmail:
  1. Enable 2-Step Verification on your Google account and create a Gmail App Password (App: Mail, Device: Other).
  2. Update `.env` with `EMAIL_SERVICE=gmail`, set `EMAIL_USER` to your Gmail address, and paste the 16-character App Password into `EMAIL_PASS`.
  3. Rebuild or restart the API service so the new credentials are loaded.
  4. You can switch back to Mailpit at any time by resetting `EMAIL_SERVICE=mailpit`; Gmail fields can remain populated for later use.
- Mailpit can remain running while Gmail mode is active; it simply will not receive messages until you toggle back.
- Remember that `.env` stays out of source control. Never commit personal credentials; only the placeholders in `.env.example` should be tracked, and keep your Gmail App Password private.

### Email rendering

- Invoice logos and marketing banners render inline via CID attachments when Gmail mode is active, preventing the "download images" prompt in Gmail.
- Keep each embedded asset under ~200 KB to stay well within Gmail's 25 MB message cap; larger files automatically fall back to their original URLs instead of being attached.
- Mailpit previews match Gmail because the same HTML and CID attachments are generated in both modes; check the attachments tab to inspect the `cid:` entries.
- If an asset is missing or exceeds the inline limit, the template gracefully falls back to linked images or hides the marketing banner so the layout remains intact.

## Developing locally

- Prisma migrations live under `services/api/prisma/migrations`. They are applied automatically on container start via `npx prisma migrate deploy`.
- The Node API exposes key routes:
  - `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/users/me`
  - `GET /api/invoice/health`, `GET /api/invoice/test`, `POST /api/invoice/summary`, `POST /api/invoice/send`
  - `POST /api/email/send`
  - `POST /api/social/snippet`
  - `GET /api/billing/health`, `POST /api/billing/create-checkout-session`, `GET /api/billing/portal-session`, `POST /api/billing/stripe/webhook`
- Frontend authentication stores the JWT in local storage and hydrates the `/dashboard` view with user + subscription data, trial countdown, stats, and the first three marketing tools.

## Extending the platform

- Drop new services under `services/<tool>/Dockerfile`, then add a section to `docker-compose.yml` and an NGINX location block to route traffic.
- Use the existing env var patterns in `.env.example` to keep runtime configuration consistent across services.
- The frontend already surfaces placeholders for extending the invoicing, email, and social snippet tooling; swap in live integrations as you wire up AI or additional workflows.

## Tear down

To stop the stack: `docker compose down`. Add `-v` to remove Postgres and n8n volumes.

## Quick Start

1. Copy environment template  
   `cp .env.example .env`

2. Build & run  
   `docker compose up --build`

3. Services  
   - Web: http://localhost:3000  
   - API: http://localhost:3001  
   - Mailpit: http://localhost:8025




