# Changelog

## v1.2.1 (2025-10-31)

- Changed: Mailer now prefers custom SMTP credentials (logging the active host/port) with Mailpit as the fallback.
- Docs: `.env.example` clarifies how to set `SYSTEM_EMAIL` and `SMTP_FROM` to verified domain senders.

## v1.2 (2025-10-30)

- Added: Gmail-safe inline images via CID attachments for invoice logo and marketing banner.
- Docs: README updated with CID behavior and size guidance.
- Notes: Falls back when assets exceed size limits.
