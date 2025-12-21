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
    const invoiceParamRaw =
      typeof req.query?.invoice === 'string'
        ? req.query.invoice
        : typeof req.query?.invoiceNumber === 'string'
          ? req.query.invoiceNumber
          : null;
    const invoiceNumber = invoiceParamRaw ? invoiceParamRaw.trim().slice(0, 128) : null;
    // Prefer Fly's stable client IP header; fall back to XFF and finally req.ip
    const flyClientIp = req.headers['fly-client-ip'];
    const forwarded = req.headers['x-forwarded-for'];
    const ipSourceRaw = flyClientIp
      ? flyClientIp
      : Array.isArray(forwarded)
        ? forwarded[0]
        : typeof forwarded === 'string'
          ? forwarded.split(',')[0]
          : req.ip || '';
    const ipSource = ipSourceRaw ? String(ipSourceRaw).trim() : '';
    const ipHash = ipSource
      ? crypto.createHash('sha256').update(String(ipSource)).digest('hex')
      : null;

    // Temporary observability to understand click traffic sources (scanners vs humans)
    const rawTarget = typeof req.query?.u === 'string' ? req.query.u : null;
    let decodedTarget = rawTarget;
    try {
      decodedTarget = rawTarget ? decodeURIComponent(rawTarget) : rawTarget;
    } catch (_err) {
      decodedTarget = rawTarget;
    }
    const headerPrefetchEntries = Object.entries(req.headers || {}).filter(([key]) =>
      key.toLowerCase().includes('prefetch')
    );
    console.log(
      [
        '[CampaignClick][observe]',
        `ts=${new Date().toISOString()}`,
        `campaignId=${id}`,
        `u=${decodedTarget || 'null'}`,
        `invoice=${invoiceNumber || 'null'}`,
        `rawUrl=${req.originalUrl || 'null'}`,
        `flyClientIp=${flyClientIp || 'null'}`,
        `xff=${forwarded || 'null'}`,
        `userAgent=${userAgent || 'null'}`,
        `referer=${req.headers?.referer || req.headers?.referrer || 'null'}`,
        `purpose=${req.headers['purpose'] || 'null'}`,
        `sec-purpose=${req.headers['sec-purpose'] || 'null'}`,
        `sec-fetch-mode=${req.headers['sec-fetch-mode'] || 'null'}`,
        `sec-fetch-site=${req.headers['sec-fetch-site'] || 'null'}`,
        `sec-fetch-dest=${req.headers['sec-fetch-dest'] || 'null'}`,
        `x-purpose=${req.headers['x-purpose'] || 'null'}`,
        `prefetch-headers=${
          headerPrefetchEntries.length
            ? headerPrefetchEntries
                .map(([k, v]) => `${k}=${Array.isArray(v) ? v.join(',') : v}`)
                .join(';')
            : 'none'
        }`,
      ].join(' | ')
    );

    await prisma.campaignClickEvent.create({
      data: {
        campaignId: id,
        ref,
        userAgent,
        ipHash,
      },
    });

    if (invoiceNumber) {
      try {
        await prisma.campaignInvoiceClick.create({
          data: {
            campaignId: id,
            invoiceNumber,
          },
        });
      } catch (err) {
        const code = err?.code || err?.meta?.code;
        if (code !== 'P2002') {
          throw err;
        }
        // Duplicate invoice click (already counted) – ignore but still redirect
      }
    }

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
