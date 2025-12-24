ALTER TABLE "InvoiceHistory"
ADD COLUMN "billedAmount" DECIMAL(18,4),
ADD COLUMN "billedCurrency" TEXT;
