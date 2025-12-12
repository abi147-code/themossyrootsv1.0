const crypto = require('crypto');
const express = require('express');

const router = express.Router();

const sanitizeRef = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 128) : null;
};

const parseRedirect = (raw) => {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.toString();
  } catch (_err) {
    return null;
  }
};

router.get('/:id/click', async (req, res) => {
  const prisma = req.prisma;
  const id = Number(req.params.id);

  if (!prisma) {
    return res.status(500).json({ message: 'Prisma not initialized' });
  }

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid campaign id.' });
  }

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { id: true, ctaTargetUrl: true },
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found.' });
    }

    const redirectUrl =
      parseRedirect(req.query?.u) || parseRedirect(campaign.ctaTargetUrl) || null;
    const ref = sanitizeRef(req.query?.ref);
    const userAgent = (req.get('user-agent') || '').slice(0, 500) || null;
    const forwarded = req.headers['x-forwarded-for'];
    const ipSourceRaw = Array.isArray(forwarded)
      ? forwarded[0]
      : typeof forwarded === 'string'
        ? forwarded.split(',')[0]
        : req.ip || '';
    const ipSource = ipSourceRaw ? String(ipSourceRaw).trim() : '';
    const ipHash = ipSource
      ? crypto.createHash('sha256').update(String(ipSource)).digest('hex')
      : null;

    await prisma.campaignClickEvent.create({
      data: {
        campaignId: id,
        ref,
        userAgent,
        ipHash,
      },
    });

    if (redirectUrl) {
      return res.redirect(302, redirectUrl);
    }

    return res.status(204).end();
  } catch (err) {
    console.error('[Campaign] Failed to log click', err);
    return res.status(500).json({ message: 'Failed to log campaign click.' });
  }
});

module.exports = router;
