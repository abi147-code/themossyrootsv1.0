-- Add enum for invoice source
CREATE TYPE "InvoiceSource" AS ENUM (
  'DASHBOARD',
  'VITE'
);

-- Add additive, nullable column to InvoiceHistory
ALTER TABLE "InvoiceHistory"
ADD COLUMN "source" "InvoiceSource";
