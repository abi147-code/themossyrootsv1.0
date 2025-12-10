-- Add styling fields to Campaign (all nullable)
ALTER TABLE "Campaign" ADD COLUMN "bannerUrl" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "logoUrl" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "ctaText" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "ctaTargetUrl" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "bannerBackgroundColor" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "bannerTextColor" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "bannerImageOpacity" DOUBLE PRECISION;
ALTER TABLE "Campaign" ADD COLUMN "bannerCopyText" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "bannerCopyTextColor" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "bannerCopyOpacity" DOUBLE PRECISION;
ALTER TABLE "Campaign" ADD COLUMN "invoicePageColor" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "invoiceTextColor" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "typographyKey" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "invoiceTemplateKey" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "colorPrimary" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "colorAccent" TEXT;
