-- Add semantic typing to invoice history entries
CREATE TYPE "InvoiceHistoryEventType" AS ENUM ('EMAIL_SENT', 'EMAIL_LOGGED');

ALTER TABLE "InvoiceHistory"
ADD COLUMN "eventType" "InvoiceHistoryEventType" NOT NULL DEFAULT 'EMAIL_SENT';
