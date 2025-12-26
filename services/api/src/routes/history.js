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
        id: true,
        billedSnapshot: true,
        customerName: true,
        customerEmail: true,
        recipient: true,
        sentAt: true,
        eventType: true,
        summary: true,
      },
      orderBy: { sentAt: 'desc' },
    });

    // Prefer invoiceNumber when present to prevent duplicate counting; fallback to history row id for stability.
    const extractInvoiceNumber = (summary) => {
      if (summary && typeof summary === 'object' && summary.invoiceNumber) {
        const value =
          typeof summary.invoiceNumber === 'string'
            ? summary.invoiceNumber
            : `${summary.invoiceNumber}`;
        const trimmed = value.trim();
        return trimmed || null;
      }
      return null;
    };

    const normalizeString = (value) => {
      if (typeof value !== 'string') return null;
      const trimmed = value.trim();
      return trimmed ? trimmed.toLowerCase() : null;
    };

    const resolveCustomerKey = (inv) => {
      const name = normalizeString(inv.customerName);
      const email = normalizeString(inv.customerEmail);
      const recipient = normalizeString(inv.recipient);
      return name || email || recipient || 'unknown';
    };

    const resolveDisplayName = (inv) => {
      if (typeof inv.customerName === 'string' && inv.customerName.trim()) {
        return inv.customerName.trim();
      }
      if (typeof inv.customerEmail === 'string' && inv.customerEmail.trim()) {
        return inv.customerEmail.trim();
      }
      if (typeof inv.recipient === 'string' && inv.recipient.trim()) {
        return inv.recipient.trim();
      }
      return null;
    };

    // Deduplicate by invoice, preferring EMAIL_SENT, otherwise most recent EMAIL_LOGGED.
    const invoiceGroups = new Map();
    for (const inv of invoices) {
      const invoiceNumber = extractInvoiceNumber(inv.summary);
      const groupKey = invoiceNumber || `history-${inv.id}`;
      const existing = invoiceGroups.get(groupKey);

      const currentIsEmailSent = inv.eventType === 'EMAIL_SENT';
      const existingIsEmailSent = existing?.eventType === 'EMAIL_SENT';

      const isBetter =
        !existing ||
        (!existingIsEmailSent && currentIsEmailSent) ||
        (existingIsEmailSent === currentIsEmailSent &&
          new Date(inv.sentAt).getTime() > new Date(existing.sentAt).getTime());

      if (isBetter) {
        invoiceGroups.set(groupKey, inv);
      }
    }

    let totalBilled = 0;
    let lastInvoiceDate = null;
    const customerTotals = new Map();

    for (const inv of invoiceGroups.values()) {
      const snapshot = inv?.billedSnapshot || {};
      const amount = snapshot?.[targetCurrency];
      if (!Number.isFinite(Number(amount))) {
        continue;
      }
      const numericAmount = Number(amount);
      totalBilled += numericAmount;

      if (inv?.sentAt) {
        const sent = new Date(inv.sentAt).getTime();
        const current = lastInvoiceDate ? new Date(lastInvoiceDate).getTime() : null;
        if (!current || sent > current) {
          lastInvoiceDate = inv.sentAt;
        }
      }

      const customerKey = resolveCustomerKey(inv);
      const existing = customerTotals.get(customerKey) || {
        name: resolveDisplayName(inv),
        email: typeof inv.customerEmail === 'string' && inv.customerEmail.trim() ? inv.customerEmail.trim() : null,
        count: 0,
        total: 0,
      };
      existing.count += 1;
      existing.total += numericAmount;
      if (!existing.name) existing.name = resolveDisplayName(inv);
      if (!existing.email && typeof inv.customerEmail === 'string' && inv.customerEmail.trim()) {
        existing.email = inv.customerEmail.trim();
      }
      customerTotals.set(customerKey, existing);
    }

    let topCustomer = null;
    let topNonUnknown = null;
    for (const [key, value] of customerTotals.entries()) {
      const candidate = {
        name: value.name,
        email: value.email,
        count: value.count,
        totalBilled: toNumber(value.total),
        key,
      };
      if (!topCustomer || candidate.totalBilled > topCustomer.totalBilled) {
        topCustomer = candidate;
      }
      if (key !== 'unknown') {
        if (!topNonUnknown || candidate.totalBilled > topNonUnknown.totalBilled) {
          topNonUnknown = candidate;
        }
      }
    }

    const winner = topNonUnknown || topCustomer;

    console.info('[OVERVIEW][SNAPSHOT]', {
      currency: targetCurrency,
      rows: invoices.length,
      dedupedInvoices: invoiceGroups.size,
      sum: toNumber(totalBilled),
    });

    return res.json({
      totalBilled: toNumber(totalBilled),
      currency: targetCurrency,
      topCustomer: winner
        ? {
            name: winner.name,
            email: winner.email,
            count: winner.count,
            totalBilled: winner.totalBilled,
          }
        : null,
      lastInvoiceDate,
    });
  } catch (error) {
    console.error('[History] Failed to compute analytics:', error);
    return res.status(500).json({ message: 'Failed to load analytics.' });
  }
});

module.exports = router;
