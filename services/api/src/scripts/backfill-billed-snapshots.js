/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const { buildBilledSnapshot } = require('../lib/fx/snapshot');

const prisma = new PrismaClient();

async function main() {
  const batchSize = 50;
  let processed = 0;
  let offset = 0;

  while (true) {
    const rows = await prisma.invoiceHistory.findMany({
      where: {
        isNormalized: true,
        normalizedAmountEur: { not: null },
        fxRateDate: { not: null },
        billedSnapshot: { equals: null },
      },
      select: {
        id: true,
        normalizedAmountEur: true,
        fxRateDate: true,
      },
      orderBy: { id: 'asc' },
      skip: offset,
      take: batchSize,
    });

    if (!rows.length) {
      break;
    }

    for (const row of rows) {
      const amountEur = Number(row.normalizedAmountEur);
      const fxDate = row.fxRateDate instanceof Date ? row.fxRateDate : new Date(row.fxRateDate);
      try {
        const snapshot = await buildBilledSnapshot({ amountEur, fxDate });
        await prisma.invoiceHistory.update({
          where: { id: row.id },
          data: { billedSnapshot: snapshot },
        });
        console.info('[BACKFILL][FX]', {
          id: row.id,
          fxDate: fxDate?.toISOString?.().slice(0, 10),
          USD: snapshot?.USD,
          EUR: snapshot?.EUR,
          INR: snapshot?.INR,
          GBP: snapshot?.GBP,
        });
      } catch (error) {
        console.error('[BACKFILL][FX] Failed to build snapshot', {
          id: row.id,
          error: error?.message || error,
        });
      }
    }

    processed += rows.length;
    offset += rows.length;
    if (rows.length < batchSize) {
      break;
    }
  }

  console.info(`[BACKFILL] Completed. Processed ${processed} rows.`);
}

main()
  .catch((err) => {
    console.error('[BACKFILL] Fatal error', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
