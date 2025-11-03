# Changelog

# Changelog

## v1.0.0-stable (2025-11-03)

- Fixed: Auth, invoices, and account avatar flows now share a single API host on port 4000.
- Fixed: Avatar uploads persist across saves and reload with normalized public URLs.
- Fixed: Invoice PDFs/email templates render the marketing banner only once.
- Docs: `.env.example` and Docker compose defaults align to localhost for development.
- Phase 1 Exit: Stabilized local stack ahead of deployment. PR: _link pending_

## v1.2.1 (2025-10-31)

- Changed: Mailer now prefers custom SMTP credentials (logging the active host/port) with Mailpit as the fallback.
- Docs: `.env.example` clarifies how to set `SYSTEM_EMAIL` and `SMTP_FROM` to verified domain senders.

## v1.2 (2025-10-30)

- Added: Gmail-safe inline images via CID attachments for invoice logo and marketing banner.
- Docs: README updated with CID behavior and size guidance.
- Notes: Falls back when assets exceed size limits.
