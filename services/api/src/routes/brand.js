const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const {
  brandDir,
  toPublicAsset,
  removeAssetFile,
} = require('../utils/avatar');

const router = express.Router();

router.use(authMiddleware);

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, brandDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ext && ext.length <= 10 ? ext : '';
    cb(null, `brand-${req.user.id}-${Date.now()}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error('Unsupported file type.'));
    }
    cb(null, true);
  },
});

function normalizeNullable(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

async function resolveOrganizationId(prisma, userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });
  if (!user || !user.organizationId) {
    return null;
  }
  return user.organizationId;
}

function formatBrandResponse(req, settings) {
  if (!settings) {
    return {
      logoUrl: null,
      primaryColor: null,
      secondaryColor: null,
      accentColor: null,
      defaultCTA: null,
    };
  }

  return {
    logoUrl: toPublicAsset(req, settings.logoUrl),
    primaryColor: settings.primaryColor ?? null,
    secondaryColor: settings.secondaryColor ?? null,
    accentColor: settings.accentColor ?? null,
    defaultCTA: settings.defaultCTA ?? null,
  };
}

router.get('/', async (req, res) => {
  const prisma = req.prisma;
  const organizationId = await resolveOrganizationId(prisma, req.user.id);

  if (!organizationId) {
    return res.status(404).json({ message: 'Organization not found.' });
  }

  try {
    const brand = await prisma.brandSettings.findUnique({
      where: { organizationId },
    });

    return res.json(formatBrandResponse(req, brand));
  } catch (error) {
    console.error('[Brand] Failed to fetch settings:', error);
    return res.status(500).json({ message: 'Failed to load brand settings.' });
  }
});

router.put('/', async (req, res) => {
  const prisma = req.prisma;
  const organizationId = await resolveOrganizationId(prisma, req.user.id);

  if (!organizationId) {
    return res.status(404).json({ message: 'Organization not found.' });
  }

  const payload = {
    logoUrl: normalizeNullable(req.body?.logoUrl ?? null),
    primaryColor: normalizeNullable(req.body?.primaryColor ?? null),
    secondaryColor: normalizeNullable(req.body?.secondaryColor ?? null),
    accentColor: normalizeNullable(req.body?.accentColor ?? null),
    defaultCTA: typeof req.body?.defaultCTA === 'string' ? req.body.defaultCTA.trim() : null,
  };

  try {
    const existing = await prisma.brandSettings.findUnique({ where: { organizationId } });

    if (!existing) {
      const created = await prisma.brandSettings.create({
        data: {
          organizationId,
          ...payload,
        },
      });
      return res.json({
        message: 'Brand settings saved.',
        brand: formatBrandResponse(req, created),
      });
    }

    // If logo is being cleared, remove the previous file
    if (!payload.logoUrl && existing.logoUrl) {
      removeAssetFile(existing.logoUrl).catch((error) =>
        console.warn('[Brand] Failed to remove logo during update:', error?.message || error)
      );
    }

    const updated = await prisma.brandSettings.update({
      where: { organizationId },
      data: payload,
    });

    return res.json({
      message: 'Brand settings updated.',
      brand: formatBrandResponse(req, updated),
    });
  } catch (error) {
    console.error('[Brand] Failed to update settings:', error);
    return res.status(500).json({ message: 'Failed to update brand settings.' });
  }
});

function cleanupUploadedLogo(file) {
  if (!file?.filename) return;
  removeAssetFile(`/uploads/brand/${file.filename}`).catch(() => {});
}

router.post('/upload-logo', (req, res, next) =>
  upload.single('logo')(req, res, (err) => {
    if (!err) return next();

    if (err.message === 'Unsupported file type.') {
      return res.status(400).json({ message: 'Unsupported logo file type.' });
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Logo file too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    }

    console.error('[Brand] Logo upload failed:', err);
    return res.status(500).json({ message: 'Failed to process logo upload.' });
  })
, async (req, res) => {
  const prisma = req.prisma;
  const organizationId = await resolveOrganizationId(prisma, req.user.id);

  if (!organizationId) {
    cleanupUploadedLogo(req.file);
    return res.status(404).json({ message: 'Organization not found.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Logo file is required.' });
  }

  const newPath = `/uploads/brand/${req.file.filename}`;

  try {
    const existing = await prisma.brandSettings.findUnique({ where: { organizationId } });

    const updated = await prisma.brandSettings.upsert({
      where: { organizationId },
      update: { logoUrl: newPath },
      create: {
        organizationId,
        logoUrl: newPath,
      },
    });

    if (existing?.logoUrl && existing.logoUrl !== newPath) {
      removeAssetFile(existing.logoUrl).catch((error) =>
        console.warn('[Brand] Failed to remove previous logo:', error?.message || error)
      );
    }

    return res.json({
      message: 'Logo uploaded.',
      brand: formatBrandResponse(req, updated),
    });
  } catch (error) {
    console.error('[Brand] Failed to persist logo:', error);
    removeAssetFile(newPath).catch(() => {});
    return res.status(500).json({ message: 'Failed to save logo.' });
  }
});

module.exports = router;
