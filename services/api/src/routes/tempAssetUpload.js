const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const {
  tempAssetRoot,
  ensureTempAssetDir,
  randomAssetName,
  toTempAssetUrl,
} = require('../utils/tempAssets');

ensureTempAssetDir();

const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/jpg'];
const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tempAssetRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ALLOWED_EXT.has(ext) ? ext : '';
    cb(null, randomAssetName(safeExt || '.png'));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const isAllowedExt = ALLOWED_EXT.has(ext);
    const isAllowedMime = ALLOWED_MIME.includes((file.mimetype || '').toLowerCase());
    if (isAllowedExt || isAllowedMime) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Only PNG and JPG are allowed.'));
    }
  },
});

const router = express.Router();

router.post('/upload-temp-asset', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: 'File is required.' });
  }

  let publicBase = (process.env.PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
  if (process.env.NODE_ENV === 'production' && publicBase.startsWith('http://')) {
    publicBase = publicBase.replace(/^http:\/\//i, 'https://');
  }
  const publicUrl = publicBase
    ? `${publicBase}/temp-assets/${file.filename}`
    : toTempAssetUrl(req, file.filename);
  return res.json({ url: publicUrl });
});

router.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: err.message || 'Upload failed.' });
  }

  if (err) {
    return res.status(400).json({ message: err.message || 'Upload failed.' });
  }

  return next();
});

module.exports = router;
