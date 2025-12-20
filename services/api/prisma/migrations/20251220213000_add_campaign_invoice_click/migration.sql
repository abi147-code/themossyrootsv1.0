CREATE TABLE "CampaignInvoiceClick" (
    "id" SERIAL PRIMARY KEY,
    "campaignId" INTEGER NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CampaignInvoiceClick_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "CampaignInvoiceClick_campaignId_invoiceNumber_key" ON "CampaignInvoiceClick"("campaignId", "invoiceNumber");
CREATE INDEX "CampaignInvoiceClick_campaignId_idx" ON "CampaignInvoiceClick"("campaignId");
