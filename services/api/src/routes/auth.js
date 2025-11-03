const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const { toPublicAvatar } = require('../utils/avatar');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const prisma = req.prisma;
  const { email, password, name, organizationName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const trialDays = Number(process.env.TRIAL_DAYS || 14);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        organization: {
          create: {
            name: organizationName || `${name || email.split('@')[0]}'s Organization`,
          },
        },
      },
    });

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        status: 'trialing',
        plan: 'trial',
        trialEndsAt: dayjs().add(trialDays, 'day').toDate(),
      },
    });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT secret not configured.' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: toPublicAvatar(req, user.avatarUrl),
      },
      subscription,
    });
  } catch (error) {
    console.error('Signup error', error);
    res.status(500).json({ message: 'Failed to sign up.' });
  }
});

router.post('/login', async (req, res) => {
  const prisma = req.prisma;
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT secret not configured.' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: toPublicAvatar(req, user.avatarUrl),
      },
      subscription: user.subscriptions[0] || null,
    });
  } catch (error) {
    console.error('Login error', error);
    res.status(500).json({ message: 'Failed to log in.' });
  }
});

module.exports = router;
