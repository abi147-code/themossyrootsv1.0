-- Add banner image position and align timestamp columns with Prisma schema
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_userId_fkey";

ALTER TABLE "Campaign"
  ADD COLUMN "bannerImagePosition" TEXT DEFAULT '50% 50%',
  ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
  ALTER COLUMN "updatedAt" DROP DEFAULT,
  ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
