const express = require('express');
const {
  sharedTransporter,
  resolveDefaultSender,
  resolveEnvelopeFrom,
  getActiveTransportMeta,
} = require('../utils/mailer');

const router = express.Router();

// --- Transporter (Mailpit by default) ---
const transporter = sharedTransporter;

const toPreview = (html) =>
  String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 280);

// ------------------------------
// Health Check
// GET /api/email/health
// ------------------------------
router.get('/health', async (_req, res) => {
  try {
    // Lightweight readiness signal; avoid network calls to SMTP each time
    res.json({ status: 'ok', service: 'Email API' });
  } catch (err) {
    res.status(500).json({ status: 'error', service: 'Email API', error: 'unavailable' });
  }
});

// ------------------------------
// Send Email
// POST /api/email/send
// Body: { to, subject, body }
// ------------------------------
router.post('/send', async (req, res) => {
  try {
    const prisma = req.prisma;
    const userId = req.user?.id;

    const payloadBytes = Buffer.byteLength(JSON.stringify(req.body || {}), 'utf8');
    const payloadKb = Math.round((payloadBytes / 1024) * 10) / 10;
    console.info(`[Email] /send payload size ~${payloadKb} KB`);
    if (payloadBytes > 9 * 1024 * 1024) {
      const payloadMb = Math.round((payloadBytes / (1024 * 1024)) * 100) / 100;
      console.warn(
        `[Email] /send payload nearing 10 MB limit (~${payloadMb} MB). Consider trimming large attachments.`
      );
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { to, subject, body } = req.body || {};

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return res.status(400).json({ message: 'Valid "to" email is required.' });
    }
    if (!subject || typeof subject !== 'string') {
      return res.status(400).json({ message: '"subject" is required.' });
    }
    if (!body || typeof body !== 'string') {
      return res.status(400).json({ message: '"body" (HTML) is required.' });
    }

    // Send via SMTP (Mailpit catches it at http://localhost:8025)
    const fromAddress = resolveDefaultSender();
    const envelopeFrom = resolveEnvelopeFrom();
    const activeTransport = getActiveTransportMeta();

    console.info(
      `[Mailer] Sending transactional email via ${activeTransport.host}:${activeTransport.port} from ${fromAddress}`
    );

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html: body,
      envelope: {
        from: envelopeFrom,
        to: Array.isArray(to) ? to : [to],
      },
      // Optionally add a text fallback:
      // text: body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
    });

    // Persist campaign record (fields must match your Prisma schema)
    const campaign = await prisma.emailCampaign.create({
      data: {
        userId,
        subject,
        content: body,
        sentAt: new Date(),
        // If your schema has "recipient" field, uncomment:
        // recipient: to,
      },
    });

    try {
      await prisma.emailHistory.create({
        data: {
          userId,
          recipient: to,
          subject,
          preview: toPreview(body),
          providerId: info?.messageId || null,
          sentAt: new Date(),
        },
      });
    } catch (historyError) {
      console.error('[Email] Failed to persist email history:', historyError);
    }

    return res.json({
      status: 'ok',
      message: 'Email sent.',
      campaign,
    });
  } catch (error) {
    const activeTransport = getActiveTransportMeta();
    console.error(
      `[Mailer] Email send failed via ${activeTransport.host}:${activeTransport.port} (secure=${
        activeTransport.secure ? 'yes' : 'no'
      })`,
      error?.message || error
    );
    console.error('Email send failed:', error);
    // Narrow common SMTP errors if needed:
    if (String(error?.message || '').toLowerCase().includes('connection')) {
      return res.status(502).json({ message: 'SMTP connection failed. Check Mailpit or SMTP settings.' });
    }
    return res.status(500).json({ message: 'Failed to send email.' });
  }
});

module.exports = router;
