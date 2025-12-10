-- Add missing styling fields (all nullable)
ALTER TABLE "Campaign" ADD COLUMN "ctaBackgroundColor" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "ctaTextColor" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "invoiceTypographyKey" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "pageBackgroundColor" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "pageColor" TEXT;
