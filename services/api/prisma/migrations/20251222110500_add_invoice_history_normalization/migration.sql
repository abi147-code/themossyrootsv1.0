-- Add enum for normalization status
CREATE TYPE "InvoiceNormalizationStatus" AS ENUM (
  'LEGACY',
  'NORMALIZED',
  'SKIPPED_RATE_UNAVAILABLE',
  'FAILED_INVALID_CURRENCY'
);

-- Add additive, nullable columns to InvoiceHistory
ALTER TABLE "InvoiceHistory"
ADD COLUMN "originalAmount" DECIMAL(18,4),
ADD COLUMN "originalCurrency" TEXT,
ADD COLUMN "originalTotal" DECIMAL(18,4),
ADD COLUMN "normalizedAmountEur" DECIMAL(18,4),
ADD COLUMN "fxRate" DECIMAL(18,8),
ADD COLUMN "fxRateDate" TIMESTAMP(3),
ADD COLUMN "fxRateSource" TEXT,
ADD COLUMN "isNormalized" BOOLEAN,
ADD COLUMN "normalizationStatus" "InvoiceNormalizationStatus";
