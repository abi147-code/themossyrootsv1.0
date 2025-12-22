const express = require('express');

const router = express.Router();

const campaignSelect = {
  id: true,
  userId: true,
  name: true,
  description: true,
  status: true,
  bannerUrl: true,
  logoUrl: true,
  ctaText: true,
  ctaTargetUrl: true,
  bannerBackgroundColor: true,
  bannerTextColor: true,
  bannerImageOpacity: true,
  bannerCopyText: true,
  bannerCopyTextColor: true,
  bannerCopyOpacity: true,
  bannerImagePosition: true,
  ctaBackgroundColor: true,
  ctaTextColor: true,
  invoicePageColor: true,
  invoiceTextColor: true,
  typographyKey: true,
  invoiceTemplateKey: true,
  invoiceTypographyKey: true,
  pageBackgroundColor: true,
  pageColor: true,
  colorPrimary: true,
  colorAccent: true,
  fromCompanyName: true,
  fromCompanyAddress: true,
  fromCompanyEmail: true,
  createdAt: true,
  updatedAt: true,
};

const normalizeNullable = (value) => {
  if (value === null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  return undefined;
};

const normalizeNumber = (value) => {
  if (value === null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

router.get('/', async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      select: campaignSelect,
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ campaigns });
  } catch (error) {
    console.error('[Campaign] Failed to fetch campaigns:', error);
    return res.status(500).json({ message: 'Failed to load campaigns.' });
  }
});

router.get('/:id', async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user?.id;
  const id = Number(req.params.id);

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid campaign id.' });
  }

  try {
    const campaign = await prisma.campaign.findFirst({
      where: { id, userId },
      select: campaignSelect,
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found.' });
    }

    return res.json({ campaign });
  } catch (error) {
    console.error('[Campaign] Failed to fetch campaign:', error);
    return res.status(500).json({ message: 'Failed to load campaign.' });
  }
});

router.post('/', async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user?.id;
  const { name, description } = req.body || {};

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const trimmedName = typeof name === 'string' ? name.trim() : '';
  if (!trimmedName) {
    return res.status(400).json({ message: 'Campaign name is required.' });
  }

  const trimmedDescription =
    typeof description === 'string' && description.trim() ? description.trim() : null;

  try {
    const campaign = await prisma.campaign.create({
      data: {
        userId,
        name: trimmedName,
        description: trimmedDescription,
        status: 'draft',
        bannerUrl: normalizeNullable(req.body.bannerUrl) ?? null,
        logoUrl: normalizeNullable(req.body.logoUrl) ?? null,
        ctaText: normalizeNullable(req.body.ctaText) ?? null,
        ctaTargetUrl: normalizeNullable(req.body.ctaTargetUrl) ?? null,
        ctaBackgroundColor: normalizeNullable(req.body.ctaBackgroundColor) ?? null,
        ctaTextColor: normalizeNullable(req.body.ctaTextColor) ?? null,
        bannerBackgroundColor: normalizeNullable(req.body.bannerBackgroundColor) ?? null,
        bannerTextColor: normalizeNullable(req.body.bannerTextColor) ?? null,
        bannerImageOpacity: normalizeNumber(req.body.bannerImageOpacity) ?? null,
        bannerCopyText: normalizeNullable(req.body.bannerCopyText) ?? null,
        bannerCopyTextColor: normalizeNullable(req.body.bannerCopyTextColor) ?? null,
        bannerCopyOpacity: normalizeNumber(req.body.bannerCopyOpacity) ?? null,
        bannerImagePosition: normalizeNullable(req.body.bannerImagePosition) ?? null,
        invoicePageColor: normalizeNullable(req.body.invoicePageColor) ?? null,
        invoiceTextColor: normalizeNullable(req.body.invoiceTextColor) ?? null,
        pageBackgroundColor: normalizeNullable(req.body.pageBackgroundColor) ?? null,
        pageColor: normalizeNullable(req.body.pageColor) ?? null,
        typographyKey: normalizeNullable(req.body.typographyKey) ?? null,
        invoiceTemplateKey: normalizeNullable(req.body.invoiceTemplateKey) ?? null,
        invoiceTypographyKey: normalizeNullable(req.body.invoiceTypographyKey) ?? null,
        colorPrimary: normalizeNullable(req.body.colorPrimary) ?? null,
        colorAccent: normalizeNullable(req.body.colorAccent) ?? null,
        fromCompanyName: normalizeNullable(req.body.fromCompanyName) ?? null,
        fromCompanyAddress: normalizeNullable(req.body.fromCompanyAddress) ?? null,
        fromCompanyEmail: normalizeNullable(req.body.fromCompanyEmail) ?? null,
      },
      select: campaignSelect,
    });

    return res.status(201).json({ campaign });
  } catch (error) {
    console.error('[Campaign] Failed to create campaign:', error);
    return res.status(500).json({ message: 'Failed to create campaign.' });
  }
});

router.put('/:id', async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user?.id;
  const id = Number(req.params.id);
  const { name, description, status } = req.body || {};

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid campaign id.' });
  }

  const trimmedName = typeof name === 'string' ? name.trim() : undefined;
  if (trimmedName !== undefined && !trimmedName) {
    return res.status(400).json({ message: 'Campaign name cannot be empty.' });
  }

  const data = {};
  if (trimmedName !== undefined) data.name = trimmedName;
  const normalizedDescription = normalizeNullable(description);
  if (normalizedDescription !== undefined) data.description = normalizedDescription;
  if (typeof status === 'string' && status.trim()) {
    data.status = status.trim();
  }
  const bannerUrl = normalizeNullable(req.body.bannerUrl);
  if (bannerUrl !== undefined) data.bannerUrl = bannerUrl;
  const logoUrl = normalizeNullable(req.body.logoUrl);
  if (logoUrl !== undefined) data.logoUrl = logoUrl;
  const ctaText = normalizeNullable(req.body.ctaText);
  if (ctaText !== undefined) data.ctaText = ctaText;
  const ctaTargetUrl = normalizeNullable(req.body.ctaTargetUrl);
  if (ctaTargetUrl !== undefined) data.ctaTargetUrl = ctaTargetUrl;
  const ctaBackgroundColor = normalizeNullable(req.body.ctaBackgroundColor);
  if (ctaBackgroundColor !== undefined) data.ctaBackgroundColor = ctaBackgroundColor;
  const ctaTextColor = normalizeNullable(req.body.ctaTextColor);
  if (ctaTextColor !== undefined) data.ctaTextColor = ctaTextColor;
  const bannerBackgroundColor = normalizeNullable(req.body.bannerBackgroundColor);
  if (bannerBackgroundColor !== undefined) data.bannerBackgroundColor = bannerBackgroundColor;
  const bannerTextColor = normalizeNullable(req.body.bannerTextColor);
  if (bannerTextColor !== undefined) data.bannerTextColor = bannerTextColor;
  const bannerImageOpacity = normalizeNumber(req.body.bannerImageOpacity);
  if (bannerImageOpacity !== undefined) data.bannerImageOpacity = bannerImageOpacity;
  const bannerCopyText = normalizeNullable(req.body.bannerCopyText);
  if (bannerCopyText !== undefined) data.bannerCopyText = bannerCopyText;
  const bannerCopyTextColor = normalizeNullable(req.body.bannerCopyTextColor);
  if (bannerCopyTextColor !== undefined) data.bannerCopyTextColor = bannerCopyTextColor;
  const bannerCopyOpacity = normalizeNumber(req.body.bannerCopyOpacity);
  if (bannerCopyOpacity !== undefined) data.bannerCopyOpacity = bannerCopyOpacity;
  const bannerImagePosition = normalizeNullable(req.body.bannerImagePosition);
  if (bannerImagePosition !== undefined) data.bannerImagePosition = bannerImagePosition;
  const invoicePageColor = normalizeNullable(req.body.invoicePageColor);
  if (invoicePageColor !== undefined) data.invoicePageColor = invoicePageColor;
  const invoiceTextColor = normalizeNullable(req.body.invoiceTextColor);
  if (invoiceTextColor !== undefined) data.invoiceTextColor = invoiceTextColor;
  const pageBackgroundColor = normalizeNullable(req.body.pageBackgroundColor);
  if (pageBackgroundColor !== undefined) data.pageBackgroundColor = pageBackgroundColor;
  const pageColor = normalizeNullable(req.body.pageColor);
  if (pageColor !== undefined) data.pageColor = pageColor;
  const typographyKey = normalizeNullable(req.body.typographyKey);
  if (typographyKey !== undefined) data.typographyKey = typographyKey;
  const invoiceTemplateKey = normalizeNullable(req.body.invoiceTemplateKey);
  if (invoiceTemplateKey !== undefined) data.invoiceTemplateKey = invoiceTemplateKey;
  const invoiceTypographyKey = normalizeNullable(req.body.invoiceTypographyKey);
  if (invoiceTypographyKey !== undefined) data.invoiceTypographyKey = invoiceTypographyKey;
  const colorPrimary = normalizeNullable(req.body.colorPrimary);
  if (colorPrimary !== undefined) data.colorPrimary = colorPrimary;
  const colorAccent = normalizeNullable(req.body.colorAccent);
  if (colorAccent !== undefined) data.colorAccent = colorAccent;
  const fromName = normalizeNullable(req.body.fromCompanyName);
  if (fromName !== undefined) data.fromCompanyName = fromName;
  const fromAddress = normalizeNullable(req.body.fromCompanyAddress);
  if (fromAddress !== undefined) data.fromCompanyAddress = fromAddress;
  const fromEmail = normalizeNullable(req.body.fromCompanyEmail);
  if (fromEmail !== undefined) data.fromCompanyEmail = fromEmail;

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: 'No changes provided.' });
  }

  try {
    const updated = await prisma.campaign.updateMany({
      where: { id, userId },
      data,
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: 'Campaign not found.' });
    }

    const campaign = await prisma.campaign.findFirst({
      where: { id, userId },
      select: campaignSelect,
    });

    return res.json({ campaign });
  } catch (error) {
    console.error('[Campaign] Failed to update campaign:', error);
    return res.status(500).json({ message: 'Failed to update campaign.' });
  }
});

router.delete('/:id', async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user?.id;
  const id = Number(req.params.id);

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid campaign id.' });
  }

  try {
    try {
      const [clickCount, invoiceClickCount] = await Promise.all([
        prisma.campaignClickEvent.count({ where: { campaignId: id } }),
        prisma.campaignInvoiceClick.count({ where: { campaignId: id } }),
      ]);
      console.info('[Campaign][delete] context', {
        campaignId: id,
        userId,
        clickCount,
        invoiceClickCount,
      });
    } catch (countErr) {
      console.error('[Campaign][delete] failed to read related counts', {
        campaignId: id,
        userId,
        code: countErr?.code,
        message: countErr?.message,
        meta: countErr?.meta,
      });
    }

    const campaign = await prisma.campaign.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found.' });
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.campaignClickEvent.deleteMany({ where: { campaignId: id } });
        await tx.campaignInvoiceClick.deleteMany({ where: { campaignId: id } });
        await tx.campaign.delete({ where: { id } });
      });
      return res.status(204).end();
    } catch (error) {
      const code = error?.code || error?.meta?.code;
      if (code === 'P2025') {
        return res.status(404).json({ message: 'Campaign not found.' });
      }
      if (code === 'P2003') {
        return res.status(409).json({ message: 'Unable to delete campaign due to related records.' });
      }
      console.error('[Campaign] Failed to delete campaign:', {
        campaignId: id,
        userId,
        code: error?.code,
        message: error?.message,
        meta: error?.meta,
      });
      return res.status(500).json({ message: 'Failed to delete campaign.' });
    }
  } catch (outerError) {
    console.error('[Campaign] Failed to delete campaign:', {
      campaignId: id,
      userId,
      code: outerError?.code,
      message: outerError?.message,
      meta: outerError?.meta,
    });
    return res.status(500).json({ message: 'Failed to delete campaign.' });
  }
});

router.get('/:id/analytics', async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user?.id;
  const id = Number(req.params.id);

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid campaign id.' });
  }

  console.info('[Campaign][analytics] entry', { campaignId: id, userId });

  try {
    const campaign = await prisma.campaign.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found.' });
    }

    const campaignIdText = String(id);

    const [rawHits, invoicesWithClicks, invoicesUsedRows, invoiceClicksByDayRaw, rawHitsByDayRaw] =
      await Promise.all([
        prisma.campaignClickEvent.count({ where: { campaignId: id } }),
        prisma.campaignInvoiceClick.count({ where: { campaignId: id } }),
        prisma.$queryRaw`
          SELECT COUNT(DISTINCT summary->>'invoiceNumber')::int AS count
          FROM "InvoiceHistory"
          WHERE "userId" = ${userId}
            AND "eventType" IN ('EMAIL_SENT', 'EMAIL_LOGGED')
            AND (
              summary->>'campaignId' = ${campaignIdText}
            );
        `,
        prisma.$queryRaw`
          SELECT
            date_trunc('day', "createdAt") as day,
            COUNT(*)::int as count
          FROM "CampaignInvoiceClick"
          WHERE "campaignId" = ${id} AND "createdAt" >= NOW() - INTERVAL '30 days'
          GROUP BY 1
          ORDER BY 1 ASC
        `,
        prisma.$queryRaw`
          SELECT
            date_trunc('day', "createdAt") as day,
            COUNT(*)::int as count
          FROM "CampaignClickEvent"
          WHERE "campaignId" = ${id} AND "createdAt" >= NOW() - INTERVAL '30 days'
          GROUP BY 1
          ORDER BY 1 ASC
        `,
      ]);

    const mapDayBuckets = (rows) =>
      Array.isArray(rows)
        ? rows.map((row) => ({
            date:
              row?.day instanceof Date
                ? row.day.toISOString()
                : typeof row?.day === 'string'
                  ? row.day
                  : null,
            count: Number(row?.count) || 0,
          }))
        : [];

    const invoiceClicksByDay = mapDayBuckets(invoiceClicksByDayRaw);
    const rawHitsByDay = mapDayBuckets(rawHitsByDayRaw);
    const invoicesUsed =
      Array.isArray(invoicesUsedRows) && invoicesUsedRows[0]
        ? Number(invoicesUsedRows[0].count) || 0
        : 0;
    const isLegacy = invoicesWithClicks === 0 && rawHits > 0;
    const ctr =
      invoicesUsed > 0 && !isLegacy ? Number((invoicesWithClicks / invoicesUsed).toFixed(4)) : null;

    return res.json({
      invoicesWithClicks,
      invoicesUsed,
      ctr,
      rawHits,
      invoiceClicksByDay,
      rawHitsByDay,
      isLegacy,
    });
  } catch (error) {
    console.error('[Campaign] Failed to load analytics:', {
      campaignId: id,
      userId,
      code: error?.code,
      message: error?.message,
      meta: error?.meta,
    });
    return res.status(500).json({ message: 'Failed to load analytics.' });
  }
});

module.exports = router;
