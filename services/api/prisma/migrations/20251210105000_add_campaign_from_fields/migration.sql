-- Add sender identity fields to Campaign (all nullable)
ALTER TABLE "Campaign" ADD COLUMN "fromCompanyName" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "fromCompanyAddress" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "fromCompanyEmail" TEXT;
