const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { toPublicAsset } = require('./avatar');

const tempAssetRoot = path.join('/tmp', 'email-assets');
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function ensureTempAssetDir() {
  try {
    fs.mkdirSync(tempAssetRoot, { recursive: true });
  } catch (error) {
    console.error('[TempAssets] Failed to ensure directory', error);
  }
  return tempAssetRoot;
}

function randomAssetName(ext = '') {
  const safeExt = ext && ext.startsWith('.') ? ext : '';
  return `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${safeExt}`;
}

function toTempAssetUrl(req, filename) {
  if (!filename) return null;
  return toPublicAsset(req, `/temp-assets/${filename}`);
}

async function cleanupTempAssets(maxAgeMs = TWENTY_FOUR_HOURS_MS) {
  try {
    const entries = await fs.promises.readdir(tempAssetRoot, { withFileTypes: true });
    const now = Date.now();
    await Promise.all(
      entries.map(async (entry) => {
        if (!entry.isFile()) return;
        const fullPath = path.join(tempAssetRoot, entry.name);
        try {
          const stats = await fs.promises.stat(fullPath);
          if (now - stats.mtimeMs > maxAgeMs) {
            await fs.promises.unlink(fullPath);
          }
        } catch (error) {
          if (error && error.code !== 'ENOENT') {
            console.warn('[TempAssets] Failed to clean file:', fullPath, error.message || error);
          }
        }
      })
    );
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      console.warn('[TempAssets] Cleanup failed:', error.message || error);
    }
  }
}

function scheduleTempAssetCleanup() {
  // Run an initial cleanup shortly after boot, then every 6 hours.
  setTimeout(() => {
    cleanupTempAssets().catch((error) => {
      console.warn('[TempAssets] Initial cleanup failed:', error?.message || error);
    });
  }, 10_000).unref();

  setInterval(() => {
    cleanupTempAssets().catch((error) => {
      console.warn('[TempAssets] Scheduled cleanup failed:', error?.message || error);
    });
  }, SIX_HOURS_MS).unref();
}

module.exports = {
  tempAssetRoot,
  ensureTempAssetDir,
  randomAssetName,
  toTempAssetUrl,
  cleanupTempAssets,
  scheduleTempAssetCleanup,
  SIX_HOURS_MS,
  TWENTY_FOUR_HOURS_MS,
};
