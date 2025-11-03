const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');
const {
  avatarDir,
  removeAvatarFile,
  toPublicAvatar,
} = require('../utils/avatar');

const router = express.Router();

router.use(authMiddleware);

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const originalExt = (file.originalname || '').split('.').pop() || '';
    const cleanExt = originalExt ? `.${originalExt.toLowerCase().slice(0, 8)}` : '';
    const filename = `${req.user.id}-${Date.now()}${cleanExt}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error('Unsupported file type.'));
    }
    cb(null, true);
  },
});

const avatarUpload = (req, res, next) =>
  upload.single('avatar')(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err.message === 'Unsupported file type.') {
      return res.status(400).json({ message: 'Unsupported avatar file type.' });
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Avatar file too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    }

    console.error('[Account] Avatar upload failed:', err);
    return res.status(500).json({ message: 'Failed to process avatar upload.' });
  });

const buildProfileResponse = (req, user) => ({
  name: user?.name ?? null,
  email: user?.email ?? '',
  avatarUrl: toPublicAvatar(req, user?.avatarUrl ?? null),
});

router.get('/', async (req, res) => {
  const prisma = req.prisma;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json(buildProfileResponse(req, user));
  } catch (error) {
    console.error('[Account] Failed to fetch profile:', error);
    return res.status(500).json({ message: 'Failed to load account details.' });
  }
});

router.put('/', avatarUpload, async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user.id;

  try {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    if (!existing) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const nextData = {};
    const previousAvatarPath = existing.avatarUrl;
    let nextAvatarPath = previousAvatarPath;

    if (typeof req.body.name === 'string') {
      const trimmedName = req.body.name.trim();
      nextData.name = trimmedName.length > 0 ? trimmedName : null;
    }

    if (req.file) {
      nextAvatarPath = `/uploads/avatars/${req.file.filename}`;
    } else {
      const rawAvatarPath =
        typeof req.body.avatarPath === 'string' ? req.body.avatarPath.trim() : undefined;
      const avatarFieldProvided = Object.prototype.hasOwnProperty.call(req.body, 'avatarPath');
      const normalizeAvatarReference = (value) => {
        if (!value) return null;
        const trimmed = value.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('/uploads/')) {
          return trimmed;
        }
        if (trimmed.startsWith('uploads/')) {
          return `/${trimmed}`;
        }
        try {
          const parsed = new URL(trimmed);
          return parsed.pathname && parsed.pathname.startsWith('/uploads/')
            ? parsed.pathname
            : trimmed;
        } catch (_error) {
          return trimmed;
        }
      };

      if (avatarFieldProvided) {
        if (rawAvatarPath) {
          const normalized = normalizeAvatarReference(rawAvatarPath);
          if (normalized) {
            nextAvatarPath = normalized;
          }
        } else if (req.body.avatarPath === null) {
          nextAvatarPath = null;
        }
      }
    }

    if (nextAvatarPath !== previousAvatarPath) {
      nextData.avatarUrl = nextAvatarPath;
    }

    if (Object.keys(nextData).length === 0) {
      return res.status(400).json({ message: 'No changes provided.' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: nextData,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
      },
    });

    if (previousAvatarPath && previousAvatarPath !== updated.avatarUrl) {
      removeAvatarFile(existing.avatarUrl).catch((error) =>
        console.warn('[Account] Failed to remove previous avatar:', error?.message || error)
      );
    }

    return res.json({
      message: 'Account updated successfully.',
      user: {
        ...updated,
        avatarUrl: toPublicAvatar(req, updated.avatarUrl),
      },
    });
  } catch (error) {
    console.error('[Account] Failed to update profile:', error);
    return res.status(500).json({ message: 'Failed to update account.' });
  }
});

router.put('/password', async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required.' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({ message: 'New password must be different from the current password.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('[Account] Failed to update password:', error);
    return res.status(500).json({ message: 'Failed to update password.' });
  }
});

router.delete('/', async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user.id;
  const { currentPassword } = req.body || {};

  if (!currentPassword) {
    return res.status(400).json({ message: 'Current password is required to delete your account.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        password: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    await prisma.user.delete({ where: { id: userId } });

    if (user.avatarUrl) {
      removeAvatarFile(user.avatarUrl).catch((error) =>
        console.warn('[Account] Failed to remove avatar during deletion:', error?.message || error)
      );
    }

    return res.json({ message: 'Account deleted successfully.' });
  } catch (error) {
    console.error('[Account] Failed to delete account:', error);
    return res.status(500).json({ message: 'Failed to delete account.' });
  }
});

module.exports = router;
