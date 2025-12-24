const express = require('express');
const { convertFromEur } = require('../lib/fx/convert');

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
      isNormalized: true,
    };

    const [sumResult, lastResult, topResult] = await Promise.all([
      prisma.invoiceHistory.aggregate({
        where: whereClause,
        _sum: { normalizedAmountEur: true },
      }),
      prisma.invoiceHistory.aggregate({
        where: whereClause,
        _max: { sentAt: true },
      }),
      prisma.invoiceHistory.groupBy({
        by: ['customerEmail', 'customerName'],
        where: whereClause,
        _sum: { normalizedAmountEur: true },
        _count: { _all: true },
        orderBy: { _sum: { normalizedAmountEur: 'desc' } },
        take: 1,
      }),
    ]);

    const totalEur = toNumber(sumResult?._sum?.normalizedAmountEur || 0);
    const conversion = await convertFromEur({
      amountEur: totalEur,
      targetCurrency,
      fxDate: new Date(),
    });
    console.info('[OVERVIEW][FX]', {
      base: 'EUR',
      target: targetCurrency,
      sumEur: totalEur,
      rate: conversion.fxRate,
      final: conversion.convertedAmount,
    });
    const totalBilled = conversion.convertedAmount;
    const lastInvoiceDate = lastResult?._max?.sentAt || null;

    const topEntry = Array.isArray(topResult) && topResult[0] ? topResult[0] : null;
    const topCustomer = topEntry
      ? {
          name: topEntry.customerName || null,
          email: topEntry.customerEmail || null,
          count: topEntry._count?._all || 0,
          totalBilled:
            targetCurrency === 'EUR'
              ? toNumber(topEntry._sum?.normalizedAmountEur || 0)
              : toNumber(topEntry._sum?.normalizedAmountEur || 0) * conversion.fxRate,
        }
      : null;

    return res.json({
      totalBilled,
      currency: targetCurrency,
      baseCurrency: 'EUR',
      fxRate: conversion.fxRate,
      topCustomer,
      lastInvoiceDate,
    });
  } catch (error) {
    console.error('[History] Failed to compute analytics:', error);
    return res.status(500).json({ message: 'Failed to load analytics.' });
  }
});

module.exports = router;
