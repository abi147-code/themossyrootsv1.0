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
    const invoices = await prisma.invoiceHistory.findMany({
      where: {
        userId,
        eventType: { in: ['EMAIL_SENT', 'EMAIL_LOGGED'] },
        billedSnapshot: { not: null },
      },
      select: {
        billedSnapshot: true,
        customerName: true,
        customerEmail: true,
        sentAt: true,
      },
      orderBy: { sentAt: 'desc' },
    });

    let totalBilled = 0;
    let lastInvoiceDate = null;
    const customerTotals = new Map();

    for (const inv of invoices) {
      const snapshot = inv?.billedSnapshot || {};
      const amount = snapshot?.[targetCurrency];
      if (!Number.isFinite(Number(amount))) {
        continue;
      }
      const numericAmount = Number(amount);
      totalBilled += numericAmount;

      if (!lastInvoiceDate && inv?.sentAt) {
        lastInvoiceDate = inv.sentAt;
      }

      const customerKey = (inv.customerEmail || inv.customerName || '').toLowerCase() || 'unknown';
      const existing = customerTotals.get(customerKey) || { name: inv.customerName || null, email: inv.customerEmail || null, count: 0, total: 0 };
      existing.count += 1;
      existing.total += numericAmount;
      if (!existing.name) existing.name = inv.customerName || null;
      if (!existing.email) existing.email = inv.customerEmail || null;
      customerTotals.set(customerKey, existing);
    }

    let topCustomer = null;
    for (const value of customerTotals.values()) {
      if (!topCustomer || value.total > topCustomer.total) {
        topCustomer = {
          name: value.name,
          email: value.email,
          count: value.count,
          totalBilled: toNumber(value.total),
        };
      }
    }

    console.info('[OVERVIEW][SNAPSHOT]', {
      currency: targetCurrency,
      rows: invoices.length,
      sum: toNumber(totalBilled),
    });

    return res.json({
      totalBilled: toNumber(totalBilled),
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
