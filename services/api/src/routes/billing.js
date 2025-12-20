const express = require('express');
const Stripe = require('stripe');
const dayjs = require('dayjs');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const billingEnabled = String(process.env.BILLING_ENABLED || '').toLowerCase() === 'true';

// If billing is disabled, short-circuit all billing routes.
router.use((req, res, next) => {
  if (!billingEnabled) {
    return res.status(404).json({ message: 'Billing is currently disabled.' });
  }
  return next();
});

const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const stripe =
  billingEnabled && stripeKey.startsWith('sk_')
    ? new Stripe(stripeKey, { apiVersion: '2024-06-20' })
    : null;

const priceMap = {
  starter: process.env.STRIPE_PRICE_STARTER || 'price_starter_test',
  growth: process.env.STRIPE_PRICE_GROWTH || 'price_growth_test',
  pro: process.env.STRIPE_PRICE_PRO || 'price_pro_test',
};

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Billing API',
    stripeConfigured: Boolean(stripe),
    webhookConfigured: Boolean(webhookSecret),
  });
});

router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ message: 'Stripe not configured. Set STRIPE_SECRET_KEY.' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const plan = String(req.body?.plan || 'growth').toLowerCase();
    const priceId = priceMap[plan] || priceMap.growth;
    const origin = req.headers.origin || process.env.APP_URL || 'http://localhost';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/cancel`,
      metadata: {
        userId: String(userId),
        plan,
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('[Billing] create-checkout-session error:', error);
    res.status(500).json({ message: 'Failed to create checkout session.' });
  }
});

router.get('/portal-session', authMiddleware, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ message: 'Stripe not configured. Set STRIPE_SECRET_KEY.' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const prisma = req.prisma;
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      select: { stripeCustomerId: true },
    });

    if (!subscription?.stripeCustomerId) {
      return res.status(404).json({ message: 'No Stripe customer linked.' });
    }

    const origin = req.headers.origin || process.env.APP_URL || 'http://localhost';
    const portal = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${origin}/dashboard`,
    });

    res.json({ url: portal.url });
  } catch (error) {
    console.error('[Billing] portal-session error:', error);
    res.status(500).json({ message: 'Failed to create portal session.' });
  }
});

router.post('/stripe/webhook', async (req, res) => {
  if (!stripe || !webhookSecret) {
    console.warn('[Billing] Stripe not configured; ignoring webhook.');
    return res.json({ received: true });
  }

  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    console.error('[Billing] Webhook signature verification failed:', error?.message || error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  const prisma = req.prisma;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId ? parseInt(session.metadata.userId, 10) : null;

        if (userId) {
          const plan = session.metadata?.plan || 'growth';
          await prisma.subscription.upsert({
            where: { userId },
            update: {
              status: 'active',
              plan,
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              trialEndsAt: null,
              activatedAt: new Date(),
            },
            create: {
              userId,
              status: 'active',
              plan,
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              trialEndsAt: null,
              activatedAt: new Date(),
            },
          });
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const plan =
          subscription.items?.data?.[0]?.price?.nickname ||
          subscription.items?.data?.[0]?.price?.id ||
          'growth';

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status || 'active',
            plan,
            stripeCustomerId: subscription.customer,
            trialEndsAt: subscription.current_period_end
              ? dayjs.unix(subscription.current_period_end).toDate()
              : null,
          },
        });
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: invoice.customer },
          data: { status: 'past_due' },
        });
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error('[Billing] Webhook handler failed:', error);
    return res.status(500).json({ message: 'Failed to process webhook.' });
  }

  res.json({ received: true });
});

module.exports = router;
