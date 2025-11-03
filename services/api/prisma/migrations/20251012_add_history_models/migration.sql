-- CreateTable
CREATE TABLE "InvoiceHistory" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "totalAmount" DECIMAL(12, 2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "summary" JSONB,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EmailHistory" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "preview" TEXT,
    "providerId" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster lookups
CREATE INDEX "InvoiceHistory_userId_idx" ON "InvoiceHistory"("userId");
CREATE INDEX "InvoiceHistory_sentAt_idx" ON "InvoiceHistory"("sentAt");
CREATE INDEX "EmailHistory_userId_idx" ON "EmailHistory"("userId");
CREATE INDEX "EmailHistory_sentAt_idx" ON "EmailHistory"("sentAt");

-- Foreign keys
ALTER TABLE "InvoiceHistory"
ADD CONSTRAINT "InvoiceHistory_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "EmailHistory"
ADD CONSTRAINT "EmailHistory_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

