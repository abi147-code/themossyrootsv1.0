-- CreateTable
CREATE TABLE "CampaignClickEvent" (
    "id" SERIAL NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "ref" TEXT,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CampaignClickEvent_campaignId_createdAt_idx" ON "CampaignClickEvent"("campaignId", "createdAt");

-- AddForeignKey
ALTER TABLE "CampaignClickEvent" ADD CONSTRAINT "CampaignClickEvent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

