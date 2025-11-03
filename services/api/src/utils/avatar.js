const fs = require('fs');
const path = require('path');

const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
const avatarDir = path.join(uploadsRoot, 'avatars');
const brandDir = path.join(uploadsRoot, 'brand');

fs.mkdirSync(avatarDir, { recursive: true });
fs.mkdirSync(brandDir, { recursive: true });

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

function sanitizeBaseUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch (_error) {
    return null;
  }
}

function resolveBaseUrl(req) {
  const envBase =
    sanitizeBaseUrl(process.env.API_PUBLIC_URL) ||
    sanitizeBaseUrl(process.env.PUBLIC_BASE_URL);

  if (envBase) {
    return envBase;
  }

  const forwardedProto = req.get('x-forwarded-proto');
  const forwardedHost = req.get('x-forwarded-host');
  const proto = forwardedProto || req.protocol || 'http';
  const host = forwardedHost || req.get('host') || 'localhost';

  return `${proto}://${host}`;
}

function toPublicAsset(req, assetPath) {
  if (!assetPath) {
    return null;
  }

  if (ABSOLUTE_URL_PATTERN.test(assetPath)) {
    return assetPath;
  }

  const baseUrl = resolveBaseUrl(req);

  try {
    return new URL(assetPath, `${baseUrl}/`).toString();
  } catch (_error) {
    return assetPath;
  }
}

function toPublicAvatar(req, avatarPath) {
  return toPublicAsset(req, avatarPath);
}

function resolveAssetDiskPath(assetPath) {
  if (!assetPath || ABSOLUTE_URL_PATTERN.test(assetPath)) {
    return null;
  }

  if (!assetPath.startsWith('/uploads/')) {
    return null;
  }

  const relative = assetPath.replace('/uploads/', '');
  return path.join(uploadsRoot, relative);
}

function resolveAvatarDiskPath(avatarPath) {
  return resolveAssetDiskPath(avatarPath);
}

async function removeAvatarFile(avatarPath) {
  const diskPath = resolveAvatarDiskPath(avatarPath);
  if (!diskPath) {
    return;
  }

  try {
    await fs.promises.unlink(diskPath);
  } catch (error) {
    if (!error || error.code === 'ENOENT') {
      return;
    }
    console.warn('[Avatar] Failed to remove file:', error.message || error);
  }
}

async function removeAssetFile(assetPath) {
  const diskPath = resolveAssetDiskPath(assetPath);
  if (!diskPath) return;
  try {
    await fs.promises.unlink(diskPath);
  } catch (error) {
    if (!error || error.code === 'ENOENT') return;
    console.warn('[Assets] Failed to remove file:', error.message || error);
  }
}

module.exports = {
  uploadsRoot,
  avatarDir,
  brandDir,
  toPublicAsset,
  toPublicAvatar,
  resolveAvatarDiskPath,
  resolveAssetDiskPath,
  removeAvatarFile,
  removeAssetFile,
};
