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
    const normalized = `${url.protocol}//${url.host}`;
    return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
  } catch (_error) {
    return null;
  }
}

function resolveBaseUrl(req) {
  const envBase =
    sanitizeBaseUrl(process.env.NEXT_PUBLIC_API_URL) ||
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
    const normalizedPath = assetPath.startsWith('/')
      ? assetPath
      : `/${assetPath}`;
    return new URL(normalizedPath, `${baseUrl}/`).toString();
  } catch (_error) {
    return assetPath;
  }
}

function toPublicAvatar(req, avatarPath) {
  if (!avatarPath) {
    return null;
  }

  const raw = String(avatarPath).trim();
  if (!raw) {
    return null;
  }

  // If an absolute URL was stored, strip to pathname so callers always get a relative path
  if (ABSOLUTE_URL_PATTERN.test(raw)) {
    try {
      const url = new URL(raw);
      if (url.pathname && url.pathname.startsWith('/')) {
        return url.pathname;
      }
    } catch (_error) {
      return raw;
    }
  }

  if (raw.startsWith('/uploads/')) {
    return raw;
  }

  if (raw.startsWith('uploads/')) {
    return `/${raw}`;
  }

  return raw.startsWith('/') ? raw : `/${raw}`;
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
