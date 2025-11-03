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
      prisma.invoiceHistory.count({ where: { userId: user.id } }),
      prisma.invoiceHistory.findMany({
        where: { userId: user.id },
        select: { customerEmail: true, customerName: true },
      }),
    ]);

    const customerIdentifiers = new Set(
      customerSnapshots.map((entry) => {
        if (entry.customerEmail && entry.customerEmail.trim()) {
          return entry.customerEmail.trim().toLowerCase();
        }
        if (entry.customerName && entry.customerName.trim()) {
          return `name:${entry.customerName.trim().toLowerCase()}`;
        }
        return null;
      }).filter(Boolean)
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

module.exports = router;
