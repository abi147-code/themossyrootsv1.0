const express = require('express');
const axios = require('axios');
const dayjs = require('dayjs');

const router = express.Router();

// --- Helpers ---
const isValidUrl = (u) => {
  try { new URL(u); return true; } catch { return false; }
};

const normalisePlatform = (p) => {
  if (!p) return 'linkedin';
  const v = String(p).toLowerCase().trim();
  if (v === 'twitter') return 'x';
  const allowed = new Set(['linkedin', 'instagram', 'x']);
  return allowed.has(v) ? v : 'linkedin';
};

// Axios client for n8n webhook
const n8nClient = axios.create({
  timeout: 8000,
  validateStatus: (s) => s >= 200 && s < 500, // let us handle non-2xx gracefully
});

// ------------------------------
// Health Check
// GET /api/social/health
// ------------------------------
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Social API' });
});

// ------------------------------
// Generate Social Snippet
// POST /api/social/snippet
// Body: { youtubeUrl, platform? }
// ------------------------------
router.post('/snippet', async (req, res) => {
  try {
    const prisma = req.prisma;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { youtubeUrl, platform } = req.body || {};
    if (!youtubeUrl || !isValidUrl(youtubeUrl)) {
      return res.status(400).json({ message: 'Valid "youtubeUrl" is required.' });
    }

    const targetPlatform = normalisePlatform(platform);
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    let snippetContent = '';

    // Try n8n webhook if configured
    if (webhookUrl) {
      try {
        const resp = await n8nClient.post(webhookUrl, {
          youtubeUrl,
          platform: targetPlatform,
        });

        // Accept either { snippet: "..."} or raw text
        if (typeof resp.data === 'object' && resp.data?.snippet) {
          snippetContent = String(resp.data.snippet);
        } else if (typeof resp.data === 'string') {
          snippetContent = resp.data.trim();
        } else if (resp.data?.content) {
          snippetContent = String(resp.data.content);
        }

        if (!snippetContent) {
          console.warn('[Social] n8n returned no snippet, falling back');
        }
      } catch (err) {
        console.warn('[Social] n8n webhook failed, using placeholder:', err?.message || err);
      }
    }

    // Fallback content if n8n missing/unavailable
    if (!snippetContent) {
      snippetContent = `Repurpose key insights from ${youtubeUrl} into a compelling ${targetPlatform} post. Lead with a hook, 1–3 crisp takeaways, and a clear call-to-action. Tag relevant partners and include a branded hashtag.`;
    }

    // Persist to DB
    const snippet = await prisma.socialSnippet.create({
      data: {
        userId,
        platform: targetPlatform,
        content: snippetContent,
        sourceUrl: youtubeUrl,
        generatedAt: dayjs().toDate(),
      },
    });

    return res.json({
      status: 'ok',
      snippet,
    });
  } catch (error) {
    console.error('[Social] Store/generate snippet failed:', error);
    return res.status(500).json({ message: 'Failed to generate snippet.' });
  }
});

module.exports = router;
