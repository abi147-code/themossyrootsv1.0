const express = require('express');

const router = express.Router();

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

router.get('/', async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // EMAIL_SENT   → Dashboard invoice sent
    // EMAIL_LOGGED → Vite invoice sent
    // Both represent successfully sent invoices and must be included in history/analytics
    const invoices = await prisma.invoiceHistory.findMany({
      where: { userId, eventType: { in: ['EMAIL_SENT', 'EMAIL_LOGGED'] } },
      orderBy: { sentAt: 'desc' },
    });

    return res.json({ invoices });
  } catch (error) {
    console.error('[History] Failed to fetch history:', error);
    return res.status(500).json({ message: 'Failed to load history.' });
  }
});

router.get('/analytics', async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferredCurrency: true },
    });
    const targetCurrency = (userRecord?.preferredCurrency || 'USD').toUpperCase();
    const whereClause = {
      userId,
      eventType: { in: ['EMAIL_SENT', 'EMAIL_LOGGED'] },
      billedCurrency: targetCurrency,
      billedAmount: { not: null },
    };

    const [sumResult, lastResult, topResult, rowCount] = await Promise.all([
      prisma.invoiceHistory.aggregate({
        where: whereClause,
        _sum: { billedAmount: true },
      }),
      prisma.invoiceHistory.aggregate({
        where: whereClause,
        _max: { sentAt: true },
      }),
      prisma.invoiceHistory.groupBy({
        by: ['customerEmail', 'customerName'],
        where: whereClause,
        _sum: { billedAmount: true },
        _count: { _all: true },
        orderBy: { _sum: { billedAmount: 'desc' } },
        take: 1,
      }),
      prisma.invoiceHistory.count({
        where: whereClause,
      }),
    ]);

    const totalBilled = toNumber(sumResult?._sum?.billedAmount || 0);
    console.info('[OVERVIEW]', {
      currency: targetCurrency,
      rows: rowCount || 0,
      sum: totalBilled,
    });
    const lastInvoiceDate = lastResult?._max?.sentAt || null;

    const topEntry = Array.isArray(topResult) && topResult[0] ? topResult[0] : null;
    const topCustomer = topEntry
      ? {
          name: topEntry.customerName || null,
          email: topEntry.customerEmail || null,
          count: topEntry._count?._all || 0,
          totalBilled: toNumber(topEntry._sum?.billedAmount || 0),
        }
      : null;

    return res.json({
      totalBilled,
      currency: targetCurrency,
      topCustomer,
      lastInvoiceDate,
    });
  } catch (error) {
    console.error('[History] Failed to compute analytics:', error);
    return res.status(500).json({ message: 'Failed to load analytics.' });
  }
});

module.exports = router;
