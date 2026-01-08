# 05 Automation, History, Analytics

This document defines automation rules and traceability requirements.

## Automation Rules (V1)

- Trigger event: ORDER_PAID only.
- One active campaign per store.
- One default invoice template per store.
- Shopify sends order data only; template and campaign are resolved in TMR.

Shopify automation pipeline:
Webhook (ORDER_PAID) ->
Internal processor ->
Vite HTML render ->
Playwright PDF ->
Email send ->
InvoiceHistory persistence

## History Tracking (Shopify Invoices)

For every Shopify-generated invoice, store:
- shopifyOrderId
- invoiceId or invoiceHistoryId
- shopDomain
- campaignId
- templateId
- status (generated / emailed / failed)
- timestamps (createdAt, processedAt)

## Analytics

- Reuse existing campaign click tracking endpoint: `/api/campaigns/:id/click`.
- CTA links embedded in invoice must route through tracking endpoint.
- Shopify history page must expose campaign usage per invoice.

## Failure Handling

- Duplicate webhooks: dedupe by `ShopifyWebhookEvent.eventId`.
- Shopify API failure: mark failed and retry up to 3 times.
- PDF generation failure: mark failed and do not email.
- Email send failure: keep generated PDF and allow retry.
- Missing campaign: disable marketing block for the invoice and proceed.

Lock:
- No Shopify flow may call Flask or WeasyPrint.
- All Shopify PDFs must originate from Playwright.
