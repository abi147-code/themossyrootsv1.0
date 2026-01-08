# 02 Customer Journey V1

This document defines the end-to-end Shopify merchant experience for V1.

## A. Entry Points

- Shopify App Store install (primary entry)
- Direct signup on TMR website (secondary entry)

## B. Onboarding Flow (V1)

1. Merchant installs the Shopify app.
2. Shopify redirects to TMR login/signup.
3. Shopify store is marked as Connected in TMR.
4. Merchant is prompted to configure invoices.

## C. Configuration Flow (TMR Dashboard Only)

- Select default invoice template.
- Select one active marketing campaign.
- Toggle auto-send invoice on or off.
- Trigger event is locked to ORDER_PAID (V1).
- Recipient email source: Shopify customer email by default, with optional override in TMR.
- Confirm automation is live.

Explicit statements:
- Campaigns do NOT live in Shopify.
- Templates are NOT edited in Shopify.
- Shopify only sends order data to TMR.
