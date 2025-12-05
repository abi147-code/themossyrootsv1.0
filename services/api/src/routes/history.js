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
    const invoices = await prisma.invoiceHistory.findMany({
      where: { userId },
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
    const [sumResult, lastResult, topResult] = await Promise.all([
      prisma.invoiceHistory.aggregate({
        where: { userId },
        _sum: { totalAmount: true },
      }),
      prisma.invoiceHistory.aggregate({
        where: { userId },
        _max: { sentAt: true },
      }),
      prisma.invoiceHistory.groupBy({
        by: ['customerEmail', 'customerName'],
        where: { userId },
        _sum: { totalAmount: true },
        _count: { _all: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 1,
      }),
    ]);

    const totalBilled = toNumber(sumResult?._sum?.totalAmount || 0);
    const lastInvoiceDate = lastResult?._max?.sentAt || null;

    const topEntry = Array.isArray(topResult) && topResult[0] ? topResult[0] : null;
    const topCustomer = topEntry
      ? {
          name: topEntry.customerName || null,
          email: topEntry.customerEmail || null,
          count: topEntry._count?._all || 0,
          totalBilled: toNumber(topEntry._sum?.totalAmount || 0),
        }
      : null;

    return res.json({
      totalBilled,
      topCustomer,
      lastInvoiceDate,
    });
  } catch (error) {
    console.error('[History] Failed to compute analytics:', error);
    return res.status(500).json({ message: 'Failed to load analytics.' });
  }
});

module.exports = router;
