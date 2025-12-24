-- Add billedSnapshot JSON column to capture multi-currency billed amounts at send time
ALTER TABLE "InvoiceHistory"
ADD COLUMN "billedSnapshot" JSONB;
