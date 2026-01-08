# 04 Data Model and API Spec

This document defines contracts only (no implementation details).

## Data Models (Prisma - Spec Only)

### ShopifyStore

- id (Int) - V1 required
- userId (Int) - V1 required
- shopDomain (String, unique) - V1 required
- accessToken (String, encrypted) - V1 required
- scopes (String) - V1 required
- installedAt (DateTime) - V1 required
- uninstalledAt (DateTime, nullable) - optional/future
- status (String, e.g., installed/uninstalled) - optional/future

### ShopifySettings

- id (Int) - V1 required
- shopDomain (String, unique) - V1 required
- defaultInvoiceTemplateId (String or Int) - V1 required
- activeCampaignId (Int) - V1 required
- autoSendEmail (Boolean) - V1 required
- triggerEvent (String enum: ORDER_PAID) - V1 required
- recipientOverrideEmail (String, nullable) - optional
- senderProfileId (Int, nullable) - optional/future

### ShopifyWebhookEvent

- id (Int) - V1 required
- shopDomain (String) - V1 required
- topic (String) - V1 required
- eventId (String, unique) - V1 required
- orderId (String, nullable) - V1 required if available
- receivedAt (DateTime) - V1 required
- processedAt (DateTime, nullable) - V1 required
- status (String, processed/failed) - V1 required
- error (String, nullable) - V1 required when failed

### ShopifyOrderInvoice (or equivalent)

Option A: extend `InvoiceHistory`
- sourceType (String enum: SHOPIFY) - V1 required
- sourceId (String: Shopify order id) - V1 required
- shopDomain (String) - V1 required
- campaignId (Int) - V1 required
- templateId (String or Int) - V1 required

Option B: join model
- id (Int) - V1 required
- shopDomain (String) - V1 required
- shopifyOrderId (String) - V1 required
- invoiceHistoryId or invoiceId (Int) - V1 required
- createdAt (DateTime) - V1 required

## API Contracts

### Install

- `GET /api/integrations/shopify/install?shop={shopDomain}`
- Response: 302 redirect to Shopify OAuth.
- Tenant resolution must come from the verified `shop` domain; never accept userId from query/body.

### Callback

- `GET /api/integrations/shopify/callback?shop={shopDomain}&code={code}&state={state}`
- Response: 302 redirect to `/dashboard/integrations/shopify` with status.
- Tenant resolution must come from the verified `shop` domain; never accept userId from query/body.

### Webhook: orders paid

- `POST /api/webhooks/shopify/orders-paid`
- Headers: `X-Shopify-Hmac-Sha256` (verified), `X-Shopify-Topic`, `X-Shopify-Shop-Domain`.
- Body: raw order payload from Shopify.
- Response: 200 OK when accepted.

### Internal invoice creation

- `POST /api/internal/shopify/:shopDomain/orders/:orderId/invoice`
- Request body:
  - `triggerEvent` (String)
  - `webhookEventId` (String)
- Response body:
  - `status` (generated/emailed/failed)
  - `invoiceId`
  - `historyId`

### History retrieval

- `GET /api/integrations/shopify/history?shopDomain={shopDomain}`
- Response body:
  - `items`: array of { shopifyOrderId, invoiceId, status, campaignId, templateId, createdAt }

### Settings load/save

- `GET /api/integrations/shopify/settings?shopDomain={shopDomain}`
- `POST /api/integrations/shopify/settings`
  - Body: { shopDomain, defaultInvoiceTemplateId, activeCampaignId, autoSendEmail, triggerEvent, recipientOverrideEmail }
- Response: settings payload.
