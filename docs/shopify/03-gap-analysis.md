# 03 Gap Analysis

This document lists everything missing to support the V1 journey.

## Data Gaps

### ShopifyStore
- Why needed: store identity and OAuth token storage.
- Where: new Prisma model in `tmr/services/api/prisma/schema.prisma`.
- V1 or deferred: V1.

### ShopifySettings
- Why needed: per-store configuration for template and campaign.
- Where: new Prisma model in `tmr/services/api/prisma/schema.prisma`.
- V1 or deferred: V1.

### ShopifyWebhookEvent
- Why needed: idempotency and operational visibility for webhooks.
- Where: new Prisma model in `tmr/services/api/prisma/schema.prisma`.
- V1 or deferred: V1.

### Shopify order to invoice linkage
- Why needed: traceability between Shopify order and invoice history.
- Where: add fields to `InvoiceHistory` or introduce join model.
- V1 or deferred: V1.

## API Gaps

### OAuth install + callback
- Why needed: store connection and token exchange.
- Where: new Express router under `/api/integrations/shopify/*`.
- V1 or deferred: V1.

### Webhook receiver (orders paid)
- Why needed: entry point for automation.
- Where: `/api/webhooks/shopify/*` (public, verified).
- V1 or deferred: V1.

### Internal order to invoice processor
- Why needed: core automation pipeline.
- Where: `/api/internal/shopify/*` (private route).
- V1 or deferred: V1.

### Shopify history fetch
- Why needed: dashboard history page to show Shopify orders and invoice status.
- Where: `/api/integrations/shopify/history` or `/api/shopify/history`.
- V1 or deferred: V1.

## UI Gaps

### Shopify integration page
- Why needed: connect/disconnect and status.
- Where: `tmr/services/web/src/app/dashboard/integrations/shopify/page.tsx`.
- V1 or deferred: V1.

### Shopify settings page
- Why needed: template/campaign selection and automation toggles.
- Where: `tmr/services/web/src/app/dashboard/shopify/settings/page.tsx`.
- V1 or deferred: V1.

### Shopify invoice history page
- Why needed: order-level invoice status and links.
- Where: `tmr/services/web/src/app/dashboard/shopify/history/page.tsx`.
- V1 or deferred: V1.
