const express = require('express');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright-chromium');
const { sharedTransporter, resolveDefaultSender, resolveEnvelopeFrom } = require('../utils/mailer');
const { attemptNormalization } = require('../lib/fx/normalize');
const auth = require('../middleware/auth');

const router = express.Router();

// Authenticated send-email endpoint for the Vite app; requires a JWT so history is attributed to the real user.
router.post('/send-email', auth, async (req, res) => {
  console.info('[ViteInvoice] Incoming payload:', req.body);
  const {
    html,
    invoiceNumber,
    toEmail,
    subject,
    message,
    senderName,
    senderEmail,
    senderAddress,
    amount,
    currency,
    invoiceBackgroundColor,
    logoUrl,
    banner,
    customerName,
    customerEmail,
    campaignId,
  } = req.body || {};
  const prisma = req.prisma;
  const userId = req.user?.id;

  if (!prisma || !userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!html || typeof html !== 'string' || !html.trim()) {
    return res.status(400).json({ error: 'HTML content is required.' });
  }

  if (!invoiceNumber || typeof invoiceNumber !== 'string' || !invoiceNumber.trim()) {
    return res.status(400).json({ error: 'invoiceNumber is required.' });
  }

  if (!toEmail || typeof toEmail !== 'string' || !toEmail.includes('@')) {
    return res.status(400).json({ error: 'A valid toEmail is required.' });
  }

  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    return res.status(400).json({ error: 'subject is required.' });
  }

  let browser;
  let context;
  let page;
  let tmpDir;

  try {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tmr-vite-invoice-'));
    const htmlPath = path.join(tmpDir, 'invoice.html');
    await fs.writeFile(htmlPath, html, 'utf8');

    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({ deviceScaleFactor: 2 });
    page = await context.newPage();

    const fileUrl = pathToFileURL(htmlPath).href;
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'screen' });

    const fullHeight = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const maxHeight = Math.max(
        doc?.scrollHeight || 0,
        body?.scrollHeight || 0,
        doc?.offsetHeight || 0,
        body?.offsetHeight || 0,
        doc?.clientHeight || 0,
        body?.clientHeight || 0,
        window.innerHeight || 0
      );
      return Math.max(maxHeight, 1);
    });

    const pdfBuffer = await page.pdf({
      width: '210mm',
      height: `${fullHeight}px`,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      printBackground: true,
      preferCSSPageSize: true,
    });

    // Drop the raw invoice HTML from the request payload so it never rides along in the email MIME body.
    if (req?.body && Object.prototype.hasOwnProperty.call(req.body, 'html')) {
      delete req.body.html;
    }

    const escapeHtml = (value) =>
      String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const sanitizeAssetUrl = (value) => {
      if (typeof value !== 'string') return '';
      const trimmed = value.trim();
      if (!trimmed) return '';
      const publicBase = (
        process.env.API_PUBLIC_URL ||
        process.env.PUBLIC_API_URL ||
        ''
      )
        .trim()
        .replace(/\/+$/, '');
      const isHttp = /^https?:\/\//i.test(trimmed);
      if (publicBase && trimmed.startsWith(publicBase)) {
        return escapeHtml(trimmed);
      }
      if (isHttp) {
        return escapeHtml(trimmed);
      }
      return '';
    };

    const publicTrackingBase = (
      process.env.API_PUBLIC_URL ||
      process.env.PUBLIC_API_URL ||
      ''
    )
      .trim()
      .replace(/\/+$/, '');
    const parsedCampaignId =
      typeof campaignId === 'number' ? campaignId : Number(campaignId);
    const rawInvoiceNumber =
      typeof invoiceNumber === 'string' && invoiceNumber.trim() ? invoiceNumber.trim() : 'invoice';
    const invoiceLabel = escapeHtml(rawInvoiceNumber);
    const buildTrackedCtaLink = (rawTarget) => {
      const trimmed = typeof rawTarget === 'string' ? rawTarget.trim() : '';
      if (!trimmed) return '';
      if (!Number.isFinite(parsedCampaignId) || parsedCampaignId <= 0) {
        return '';
      }
      if (!publicTrackingBase) {
        return '';
      }
      const search = new URLSearchParams({
        u: trimmed,
        invoice: rawInvoiceNumber,
      }).toString();
      return `${publicTrackingBase}/api/campaigns/${parsedCampaignId}/click?${search}`;
    };

    const displaySenderName =
      typeof senderName === 'string' && senderName.trim()
        ? escapeHtml(senderName.trim())
        : 'Sender details not provided';
    const displaySenderEmail =
      typeof senderEmail === 'string' && senderEmail.trim()
        ? escapeHtml(senderEmail.trim())
        : 'No email provided';
    const displaySenderAddress =
      typeof senderAddress === 'string' && senderAddress.trim()
        ? escapeHtml(senderAddress.trim())
        : 'No address provided';
    const headerColor =
      typeof invoiceBackgroundColor === 'string' && invoiceBackgroundColor.trim()
        ? escapeHtml(invoiceBackgroundColor.trim())
        : '#0f172a';
    const brandColorHeader = headerColor;
    const safeLogoUrl = sanitizeAssetUrl(logoUrl);
    const bannerData = banner && typeof banner === 'object' ? banner : {};
    const bannerEnabled = !!bannerData.enabled;
    const bannerText =
      typeof bannerData.text === 'string' && bannerData.text.trim()
        ? escapeHtml(bannerData.text.trim())
        : '';
    const bannerBg =
      typeof bannerData.backgroundColor === 'string' && bannerData.backgroundColor.trim()
        ? escapeHtml(bannerData.backgroundColor.trim())
        : '#0f172a';
    const bannerTextColor =
      typeof bannerData.textColor === 'string' && bannerData.textColor.trim()
        ? escapeHtml(bannerData.textColor.trim())
        : '#ffffff';
    const bannerImageUrl = sanitizeAssetUrl(bannerData.imageUrl);
    const bannerCtaText =
      typeof bannerData.ctaText === 'string' && bannerData.ctaText.trim()
        ? escapeHtml(bannerData.ctaText.trim())
        : '';
    const rawBannerCta =
      typeof bannerData.ctaLink === 'string' && bannerData.ctaLink.trim()
        ? bannerData.ctaLink.trim()
        : typeof bannerData.ctaTargetUrl === 'string' && bannerData.ctaTargetUrl.trim()
          ? bannerData.ctaTargetUrl.trim()
          : '';
    const bannerCtaLink = buildTrackedCtaLink(rawBannerCta);
    const bannerCtaBg =
      typeof bannerData.ctaBackgroundColor === 'string' && bannerData.ctaBackgroundColor.trim()
        ? escapeHtml(bannerData.ctaBackgroundColor.trim())
        : bannerTextColor;
    const bannerCtaTextColor =
      typeof bannerData.ctaTextColor === 'string' && bannerData.ctaTextColor.trim()
        ? escapeHtml(bannerData.ctaTextColor.trim())
        : bannerBg;

    const numericAmount = typeof amount === 'number' ? amount : Number(amount);
    const hasAmount = Number.isFinite(numericAmount);
    const cleanCurrency = typeof currency === 'string' && currency.trim() ? currency.trim() : 'USD';
    let formattedAmount = 'Amount not provided';
    if (hasAmount) {
      try {
        formattedAmount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: cleanCurrency,
        }).format(numericAmount);
      } catch (_err) {
        formattedAmount = `${cleanCurrency} ${numericAmount.toFixed(2)}`;
      }
    }

    const safeMessage =
      typeof message === 'string' && message.trim() ? escapeHtml(message.trim()) : 'Please find your invoice attached.';

    const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Invoice</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial, sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:${brandColorHeader};color:#ffffff;padding:20px;text-align:left;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div>
                  <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.8;">Invoice</div>
                  <div style="font-size:20px;font-weight:700;margin-top:4px;">${displaySenderName}</div>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px;background:#ffffff;">
              <div style="font-size:14px;line-height:1.6;margin-bottom:14px;color:#0f172a;">${safeMessage}</div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                <tr>
                  <td style="width:50%;padding-right:12px;vertical-align:top;">
                    <div style="font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;margin-bottom:6px;">Invoice Number</div>
                    <div style="font-size:18px;font-weight:700;color:#0f172a;">${invoiceLabel}</div>
                  </td>
                  <td style="width:50%;padding-left:12px;vertical-align:top;">
                    <div style="font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;margin-bottom:6px;">Amount</div>
                    <div style="font-size:24px;font-weight:700;color:#0f172a;line-height:1.2;">${formattedAmount}</div>
                    <div style="font-size:13px;color:#475569;margin-top:6px;">Currency: ${escapeHtml(cleanCurrency)}</div>
                  </td>
                </tr>
              </table>
              <div style="margin-top:16px;font-size:13px;line-height:1.5;color:#475569;">
                <div style="font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;margin-bottom:6px;">From</div>
                <div style="font-weight:600;color:#0f172a;">${displaySenderName}</div>
                <div style="margin-top:4px;color:#0f172a;">${displaySenderEmail}</div>
                <div style="margin-top:4px;white-space:pre-line;">${displaySenderAddress}</div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 20px 24px 20px;background:#f8fafc;text-align:center;color:#94a3b8;font-size:12px;">
              Delivered securely via The Mossy Roots
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const fromAddress = resolveDefaultSender();
    const envelopeFrom = resolveEnvelopeFrom();

    // Temporary observability: capture CTA state and first anchor before sending
    try {
      const firstAnchorMatch = emailHtml.match(/href="([^"]+)"/i);
      console.info('[ViteInvoice][cta-snapshot]', {
        campaignId: parsedCampaignId || null,
        invoiceNumber: rawInvoiceNumber || null,
        banner: {
          ctaLink: bannerData?.ctaLink || null,
          ctaTargetUrl: bannerData?.ctaTargetUrl || null,
          builtCtaLink: bannerCtaLink || null,
        },
        firstHref: firstAnchorMatch ? firstAnchorMatch[1] : null,
      });
    } catch (logErr) {
      console.warn('[ViteInvoice][cta-snapshot] failed to log CTA snapshot', logErr);
    }

    console.info('[ViteInvoice] Final emailHtml sample:', emailHtml.slice(0, 400));

    const info = await sharedTransporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject,
      html: emailHtml,
      envelope: {
        from: envelopeFrom,
        to: [toEmail],
      },
      attachments: [
        {
          filename: `invoice-${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    console.info('[ViteInvoice] SendGrid sendMail result:', info);
    // NOTE: Do NOT write InvoiceHistory here. Vite invoices are persisted in /save-history only
    // to avoid duplicate rows and analytics corruption.

    res.json({ status: 'ok', message: 'Invoice email sent.' });
  } catch (err) {
    console.error('[vite-invoice] Failed to send invoice email', err);
    res.status(500).json({ error: 'Failed to send invoice email' });
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (err) {
        // ignore
      }
    }
    if (context) {
      try {
        await context.close();
      } catch (err) {
        // ignore
      }
    }
    if (browser) {
      try {
        await browser.close();
      } catch (err) {
        // ignore
      }
    }
    if (tmpDir) {
      try {
        await fs.rm(tmpDir, { recursive: true, force: true });
      } catch (err) {
        // ignore
      }
    }
  }
});

router.post('/generate-pdf', async (req, res) => {
  const { html, invoiceNumber } = req.body || {};

  if (!html || typeof html !== 'string' || !html.trim()) {
    return res.status(400).json({ error: 'HTML content is required.' });
  }

  if (!invoiceNumber || typeof invoiceNumber !== 'string' || !invoiceNumber.trim()) {
    return res.status(400).json({ error: 'invoiceNumber is required.' });
  }

  let browser;
  let context;
  let page;
  let tmpDir;

  try {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tmr-vite-invoice-'));
    const htmlPath = path.join(tmpDir, 'invoice.html');
    await fs.writeFile(htmlPath, html, 'utf8');

    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({ deviceScaleFactor: 2 });
    page = await context.newPage();

    const fileUrl = pathToFileURL(htmlPath).href;
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'screen' });

    const fullHeight = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const maxHeight = Math.max(
        doc?.scrollHeight || 0,
        body?.scrollHeight || 0,
        doc?.offsetHeight || 0,
        body?.offsetHeight || 0,
        doc?.clientHeight || 0,
        body?.clientHeight || 0,
        window.innerHeight || 0
      );
      return Math.max(maxHeight, 1);
    });

    const pdfBuffer = await page.pdf({
      width: '210mm',
      height: `${fullHeight}px`,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      printBackground: true,
      preferCSSPageSize: true,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('[vite-invoice] Failed to generate PDF', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (err) {
        // ignore
      }
    }
    if (context) {
      try {
        await context.close();
      } catch (err) {
        // ignore
      }
    }
    if (browser) {
      try {
        await browser.close();
      } catch (err) {
        // ignore
      }
    }
    if (tmpDir) {
      try {
        await fs.rm(tmpDir, { recursive: true, force: true });
      } catch (err) {
        // ignore
      }
    }
  }
});

// Protect the remaining routes (e.g., history endpoints).
router.use(auth);

router.post('/save-history', async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user?.id;
  if (!prisma || !userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    customerName,
    customerEmail,
    recipient,
    subject,
    totalAmount,
    sentAt,
    invoiceNumber,
    currency,
    summary,
    senderName,
    senderEmail,
    senderAddress,
    message,
    banner,
    logoUrl,
    invoiceBackgroundColor,
    campaignId,
  } = req.body || {};

  const reqId = `vh_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  console.info('[VITE][SAVE-HISTORY][IN]', {
    reqId,
    at: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
    ua: req.headers['user-agent'],
    referer: req.headers['referer'],
    origin: req.headers['origin'],
    userId,
    invoiceNumber: invoiceNumber || (summary && summary.invoiceNumber) || null,
  });

  const cleanString = (value) => (typeof value === 'string' ? value.trim() : '');
  const requiredString = (value) => cleanString(value) || null;

  const nameValue = requiredString(customerName);
  if (!nameValue) {
    return res.status(400).json({ error: 'customerName is required.' });
  }

  const recipientValue = requiredString(recipient);
  if (!recipientValue || !recipientValue.includes('@')) {
    return res.status(400).json({ error: 'A valid recipient email is required.' });
  }

  const subjectValue = requiredString(subject);
  if (!subjectValue) {
    return res.status(400).json({ error: 'subject is required.' });
  }

  const invoiceNumberValue = requiredString(invoiceNumber);
  if (!invoiceNumberValue) {
    return res.status(400).json({ error: 'invoiceNumber is required.' });
  }

  const currencyValue = requiredString(currency);
  if (!currencyValue) {
    return res.status(400).json({ error: 'currency is required.' });
  }

  const numericTotal =
    typeof totalAmount === 'number' ? totalAmount : Number(totalAmount);
  if (!Number.isFinite(numericTotal)) {
    return res.status(400).json({ error: 'totalAmount must be a number.' });
  }

  const sentAtDate = sentAt ? new Date(sentAt) : null;
  if (!sentAtDate || Number.isNaN(sentAtDate.getTime())) {
    return res.status(400).json({ error: 'sentAt must be a valid date/time.' });
  }

  const summaryPayload = summary && typeof summary === 'object' ? summary : {};
  summaryPayload.invoiceNumber = invoiceNumberValue;
  summaryPayload.currency = currencyValue;
  summaryPayload.senderName = summaryPayload.senderName || cleanString(senderName);
  summaryPayload.senderEmail = summaryPayload.senderEmail || cleanString(senderEmail);
  summaryPayload.senderAddress =
    summaryPayload.senderAddress || cleanString(senderAddress);
  summaryPayload.message = summaryPayload.message || cleanString(message);
  summaryPayload.banner = summaryPayload.banner || banner;
  summaryPayload.logoUrl = summaryPayload.logoUrl || cleanString(logoUrl);
  summaryPayload.invoiceBackgroundColor =
    summaryPayload.invoiceBackgroundColor || cleanString(invoiceBackgroundColor);
  const parsedCampaignId =
    typeof campaignId === 'number' ? campaignId : Number(campaignId);
  const campaignIdValue =
    Number.isFinite(parsedCampaignId) && parsedCampaignId > 0 ? parsedCampaignId : null;
  if (campaignIdValue !== null) {
    summaryPayload.campaignId = campaignIdValue;
  }

  const duplicateWindowStart = new Date(Date.now() - 60 * 1000);

  try {
    const normalizationResult = await attemptNormalization({
      currency: currencyValue,
      amount: numericTotal,
      atDate: sentAtDate,
    });
    const normalizationData =
      normalizationResult && normalizationResult.writeData ? normalizationResult.writeData : null;

    if (normalizationResult?.status === 'success') {
    console.info('[FX] Normalization success (vite save-history)', {
      invoiceId: invoiceNumberValue,
      currency: normalizationResult.log?.currency,
      amount: normalizationResult.log?.amount,
      normalizedAmountEur: normalizationResult.log?.normalizedAmountEur,
        fxRate: normalizationResult.log?.fxRate,
        fxRateDate: normalizationResult.log?.fxRateDate,
      });
    } else if (normalizationResult && normalizationResult.status !== 'flag_disabled') {
      console.warn('[FX] Normalization skipped (vite save-history)', {
        invoiceId: invoiceNumberValue,
        reason: normalizationResult.log?.reason || 'UNKNOWN',
        currency: normalizationResult.log?.currency,
        error: normalizationResult.log?.error,
      });
    }

    const existing = await prisma.invoiceHistory.findFirst({
      where: {
        userId,
        eventType: 'EMAIL_LOGGED',
        createdAt: { gte: duplicateWindowStart },
        recipient: recipientValue,
        subject: subjectValue,
        summary: {
          path: ['invoiceNumber'],
          equals: invoiceNumberValue,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      return res.json({ status: 'skipped', reason: 'duplicate', id: existing.id });
    }

    const customerEmailValue = cleanString(customerEmail) || recipientValue;

    /**
     * SINGLE SOURCE OF TRUTH (Vite flow):
     * InvoiceHistory rows MUST be created ONLY here (/save-history).
     * Do NOT add InvoiceHistory.create anywhere else in the Vite flow.
     */
    console.info('[InvoiceHistory][VITE] creating history row', {
      invoiceNumber: summaryPayload?.invoiceNumber,
      userId,
      reqId,
    });

    const record = await prisma.invoiceHistory.create({
      data: {
        userId,
        customerName: nameValue,
        customerEmail: customerEmailValue || null,
        recipient: recipientValue,
        subject: subjectValue,
        totalAmount: numericTotal.toFixed(2),
        status: 'sent',
        eventType: 'EMAIL_LOGGED',
        summary: summaryPayload,
        sentAt: sentAtDate,
        source: 'VITE',
        ...(normalizationData || {}),
      },
    });

    console.info('[VITE][SAVE-HISTORY][AFTER-CREATE]', {
      reqId,
      createdId: record?.id,
      userId,
      invoiceNumber: summaryPayload?.invoiceNumber,
    });

    return res.json({ status: 'saved', id: record.id });
  } catch (err) {
    console.error('[vite-invoice] Failed to save invoice history', err);
    return res.status(500).json({ error: 'Failed to save invoice history.' });
  }
});

module.exports = router;
