# 07 Missing Pieces and Starting Point

## 1. Confirmed Inputs (Do Not Re-Explain)

- Shopify invoices use Vite -> Playwright.
- Invoice templates = saved invoice layouts.
- Auto-send is OFF by default.
- Missing customer email generates invoice, does not email, shows warning.
- Campaign logic reused.
- Shopify is data source only.

## 2. Missing Capabilities (What We Don’t Have Yet)

### 2.1 Saved Invoice Layout Persistence

- Why Shopify automation needs it: automation needs a persistent layout reference per store to render consistent invoices without manual input.
- Why reusing existing Vite config is the correct UX: merchants already design layouts in the Vite tool; Shopify should reuse those saved layouts to avoid duplicate configuration.
- What is missing today (fact-based): no stored, queryable "saved invoice layout" entity tied to a user/store; Vite config is not persisted as a reusable layout for automation.

### 2.2 Shopify Order -> Vite Payload Mapping

- Why current invoice payloads are incompatible with raw Shopify orders: current invoice payloads are shaped for the Vite renderer, not Shopify order JSON.
- Need for a pure mapping layer (no DB, no side effects): mapping must be deterministic and testable without IO to prevent coupling between Shopify payloads and invoice rendering.

### 2.3 Shopify Settings Resolution Logic

- Why automation logic must be centralized: each order event should resolve layout, campaign, and email behavior consistently.
- Why resolving layout + campaign + email behavior per store is required: settings are per shop domain and must be applied uniformly.

### 2.4 Shopify-Specific Invoice History

- Why existing `InvoiceHistory` is insufficient on its own: it lacks Shopify order identifiers, per-order status, and retry context.
- Need for order-level visibility, retries, and status clarity: Shopify automation requires tracking generated vs emailed vs paused states at the order level.

### 2.5 Email Paused State

- Why "generated but not emailed" must be first-class: missing customer email should pause email while preserving the generated invoice.
- Difference between `paused` vs `failed`: paused is a recoverable configuration issue; failed is a processing error.

### 2.6 Setup Completion Guardrails

- Why users must not accidentally enable automation without config: missing layout or campaign would result in incomplete invoices or misconfigured sends.
- Need for a readiness check: must block enablement until required settings exist.

### 2.7 Playwright PDF Persistence

- Why this is needed: Shopify automation requires the ability to retry emails, allow invoice downloads, and audit exactly what was sent to the customer.
- Current limitation: Playwright-generated PDFs are created in memory and discarded after email send.
- Required behavior for V1: Shopify-generated PDFs must be persisted after Playwright rendering and referenced from invoice history.
- Scope guard: This applies only to Shopify invoices and does not change existing dashboard/manual flows.

## 3. Required Data Models (SPEC ONLY -- NO CODE)

### InvoiceLayout

- Purpose: persist saved Vite invoice layouts for reuse.
- Key fields: id, userId, name, layoutConfig (serialized Vite config), createdAt, updatedAt.
- Why required for V1: Shopify must select a layout by id to render invoices.
- Not handling: no Shopify settings, no campaign logic, no send status.

### ShopifyStore

- Purpose: store Shopify connection identity and credentials.
- Key fields: id, userId, shopDomain, accessToken, scopes, installedAt, status.
- Why required for V1: OAuth connection and domain-based tenant resolution.
- Not handling: no invoice settings or history.

### ShopifySettings

- Purpose: per-store automation configuration.
- Key fields: id, shopDomain, defaultInvoiceLayoutId, activeCampaignId, autoSendEmail, recipientOverrideEmail, triggerEvent.
- Why required for V1: resolve layout + campaign + email behavior for every order.
- Not handling: no webhook storage or order history.

### ShopifyWebhookEvent

- Purpose: idempotency and processing status for incoming webhooks.
- Key fields: id, shopDomain, topic, eventId, orderId, receivedAt, processedAt, status, error.
- Why required for V1: prevent double-processing and support retries.
- Not handling: no invoice payload mapping or rendering.

### ShopifyInvoiceHistory (or equivalent join)

- Purpose: order-level Shopify invoice tracking.
- Key fields: id, shopDomain, shopifyOrderId, invoiceHistoryId, status, campaignId, layoutId, createdAt, updatedAt.
- Why required for V1: show Shopify-specific history, retries, and status clarity.
- Not handling: no rendering or email transport logic.

## 4. Required Pure Logic (No Routes, No DB)

### resolveShopifyInvoiceSettings(shopDomain)

- Inputs: shopDomain.
- Outputs: { layoutId, campaignId, autoSendEmail, recipientOverrideEmail, triggerEvent }.
- Why it must be pure: stable, testable settings resolution with no side effects.
- Prevents: duplicated resolution logic across webhooks and internal processors.

### mapShopifyOrderToViteInvoicePayload(order, layout, campaign)

- Inputs: Shopify order JSON, layout config, campaign payload.
- Outputs: Vite invoice payload for HTML render.
- Why it must be pure: deterministic mapping for predictable rendering and tests.
- Prevents: spaghetti mapping logic inside webhooks or email senders.

### isShopifyAutomationReady(shopDomain)

- Inputs: shopDomain.
- Outputs: boolean plus missing-requirements list.
- Why it must be pure: reusable readiness checks for UI and automation guards.
- Prevents: enabling automation without required config.

## 5. Reused Pipelines (Explicit)

- Vite invoice HTML render.
- Playwright PDF generation.
- Existing campaign click tracking endpoint.
- Existing email sending utility.
- Existing `InvoiceHistory` creation logic (extended, not replaced).
- Playwright PDF generation output must be persisted for Shopify invoices before email send.

## 6. Where Implementation MUST Start

The first implementation task MUST be database and persistence only.

Order of work:
1. Prisma models
2. Migrations
3. Pure logic
4. OAuth connect
5. Webhooks
6. Automation

Note: Prisma changes must account for storing a reference to the persisted Playwright PDF (path or identifier), but the storage implementation itself is out of scope for this analysis document.

## 7. Explicit Non-Goals (V1)

- Payment links
- Flask usage
- Template engine
- Campaign rules
- Embedded Shopify UI
- A/B testing
- Retroactive emails
- Multi-language extensions

## 8. Final Readiness Checklist

- [ ] All missing capabilities identified
- [ ] DB models defined at spec level
- [ ] No Flask dependency for Shopify
- [ ] UX decisions reflected in data design
- [ ] Implementation order is unambiguous
- [ ] Ready to open feat/shopify-integration-v1
