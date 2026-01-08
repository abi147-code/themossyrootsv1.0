# 06 V1 Scope and Exclusions

## V1 Must Include

- Shopify store connection
- Automated invoice generation
- Campaign and CTA injection
- PDF generation via Vite -> Playwright only
- Persistence of Playwright-generated invoice PDFs for Shopify invoices (to support retries, downloads, and audit)
- Email sending
- Invoice history
- Campaign analytics reuse

## V1 Must Not Include

- Embedded Shopify admin UI
- Campaign rules engine
- A/B testing
- Payment links
- Multi-language invoice logic beyond current support
- Any use of Flask for Shopify invoices
- Any mixed PDF engines in Shopify flows

## Decision Log (V1)

- Trigger event: ORDER_PAID only.
- Campaigns and templates are configured in TMR, not Shopify.
- CTA tracking uses `/api/campaigns/:id/click` with invoice context.
- Missing campaign disables the marketing block (invoice still sends).
- PDF generation must use Vite -> Playwright only (no alternate engines).
- Shopify invoices must persist the generated Playwright PDF; in-memory-only PDFs are insufficient for automation.

## Validation Checklist

- [ ] All reuse points confirmed from current branch
- [ ] No violation of PDF single-source rule
- [ ] Shopify logic isolated from core invoice logic
- [ ] Customer journey requires no Shopify-side configuration
- [ ] V1 scope achievable in <= 3 days
- [ ] Ready to open `feat/shopify-integration-v1`
