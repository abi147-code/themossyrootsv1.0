# 01 Current State Confirmed

This document confirms what exists now in the codebase. Facts only.

## Architecture (services, routing, flows)

- Docker Compose stack: `tmr/docker-compose.yml`
  - Services: `proxy` (nginx), `web` (Next.js), `api` (Express), `invoice-api` (Flask), `db` (Postgres), `mailpit`, `n8n`.
- NGINX routing: `tmr/proxy/nginx.local.conf`
  - `/` -> `web` (Next.js)
  - `/api/` -> `api` (Express)
  - `/invoice/` -> `invoice-api` (Flask)
  - `/invoice-generator/` -> static Vite assets
  - `/uploads/`, `/temp-assets/` -> `api` static handling

Invoice generation pipelines:
- Dashboard invoice send flow: `tmr/services/api/src/routes/invoice.js`
  - API calls Flask `POST /generate-pdf` via `INVOICE_API_URL`.
  - Flask writes PDF to disk: `tmr/services/invoice-api/app.py` -> `PDF_STORAGE_DIR`.
  - API attaches PDF to email and sends via Mailpit (`tmr/services/api/src/utils/mailer.js`).
- Vite invoice generator flow (separate tool): `tmr/services/api/src/routes/viteInvoice.js`
  - Uses Playwright to generate PDF from HTML.
  - Sends email and logs history via `/api/vite-invoice/save-history`.
- Shopify-triggered invoices use ONLY the Vite -> Playwright pipeline:
  - Route: `tmr/services/api/src/routes/viteInvoice.js`
  - HTML rendered server-side
  - PDF generated via Playwright
  - History persisted via Vite invoice history flow
- Flask invoice-api is NOT used for Shopify invoices under any circumstance.

Email sending pipeline:
- Branded HTML: `tmr/services/api/src/email/sendInvoiceEmail.js`
- Mail transport: `tmr/services/api/src/utils/mailer.js` (Mailpit by default in docker-compose).

Campaign click tracking:
- `GET /api/campaigns/:id/click`: `tmr/services/api/src/routes/campaignTrackingRoutes.js` logs raw click and invoice click by invoice number.

Invoice history persistence:
- Dashboard flow creates `InvoiceHistory` inside `tmr/services/api/src/routes/invoice.js`.
- Vite flow creates `InvoiceHistory` inside `tmr/services/api/src/routes/viteInvoice.js`.

## Data Model (Prisma)

Schema: `tmr/services/api/prisma/schema.prisma`

Tables relevant to invoices, marketing, and history:
- `Invoice`
- `InvoiceHistory`
- `Campaign`
- `CampaignClickEvent`
- `CampaignInvoiceClick`
- `EmailHistory`
- `Organization`
- `BrandSettings`
- `User`, `Customer`

What the current schema already supports:
- Campaign metadata and click analytics.
- Invoice history rows with JSON summary payloads, per-user filtering, and analytics calculations.
- Brand and organization settings separate from campaigns.

## Current Reuse Points (Paths)

- API app and routing: `tmr/services/api/src/app.js`
- Invoice API router: `tmr/services/api/src/routes/invoice.js`
- Vite invoice routes: `tmr/services/api/src/routes/viteInvoice.js`
- Campaign tracking and analytics: `tmr/services/api/src/routes/campaignTrackingRoutes.js`, `tmr/services/api/src/routes/campaignRoutes.js`
- Invoice history: `tmr/services/api/src/routes/history.js`
- Flask PDF engine: `tmr/services/invoice-api/app.py`
- Dashboard pages: `tmr/services/web/src/app/dashboard/*`
