const express = require('express');
const dayjs = require('dayjs');
const authMiddleware = require('../middleware/auth');
const { toPublicAvatar } = require('../utils/avatar');

const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {
  const prisma = req.prisma;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        organization: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const [invoiceCount, customerSnapshots] = await Promise.all([
      prisma.invoiceHistory.count({
        where: {
          userId: user.id,
          status: 'sent',
          eventType: { in: ['EMAIL_SENT', 'EMAIL_LOGGED'] },
        },
      }),
      prisma.invoiceHistory.findMany({
        where: { userId: user.id },
        select: { customerEmail: true, customerName: true, recipient: true },
      }),
    ]);

    const normalizeIdentity = (entry) => {
      // Prioritize client name as the identifier, then email/recipient.
      const name = entry.customerName && entry.customerName.trim();
      if (name) {
        return `name:${name.toLowerCase()}`;
      }
      const email = entry.customerEmail && entry.customerEmail.trim();
      if (email) {
        return email.toLowerCase();
      }
      const recipientEmail = entry.recipient && entry.recipient.trim();
      if (recipientEmail) {
        return recipientEmail.toLowerCase();
      }
      return null;
    };

    const customerIdentifiers = new Set(
      customerSnapshots
        .map((entry) => normalizeIdentity(entry))
        .filter(Boolean)
    );

    const customerCount = customerIdentifiers.size;

    const subscription = user.subscriptions[0] || null;
    const trialEndsAt = subscription?.trialEndsAt
      ? dayjs(subscription.trialEndsAt).toISOString()
      : null;

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: toPublicAvatar(req, user.avatarUrl),
      preferredCurrency: user.preferredCurrency || 'USD',
      organization: user.organization,
      subscription,
      trialEndsAt,
      stats: {
        customers: customerCount,
        invoices: invoiceCount,
      },
    });
  } catch (error) {
    console.error('Fetch current user failed', error);
    res.status(500).json({ message: 'Failed to fetch profile.' });
  }
});

router.patch('/me', authMiddleware, async (req, res) => {
  const prisma = req.prisma;
  const allowed = ['USD', 'EUR', 'INR', 'GBP'];
  const preferredCurrencyRaw = req.body?.preferredCurrency;
  const preferredCurrency =
    typeof preferredCurrencyRaw === 'string' && preferredCurrencyRaw.trim()
      ? preferredCurrencyRaw.trim().toUpperCase()
      : null;

  if (!preferredCurrency || !allowed.includes(preferredCurrency)) {
    return res.status(400).json({ message: 'Invalid currency code.' });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { preferredCurrency },
    });

    return res.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      avatarUrl: toPublicAvatar(req, updated.avatarUrl),
      preferredCurrency: updated.preferredCurrency || 'USD',
    });
  } catch (error) {
    console.error('Update preferred currency failed', error);
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
});

module.exports = router;
