const express = require('express');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright-chromium');
const { sharedTransporter, resolveDefaultSender, resolveEnvelopeFrom } = require('../utils/mailer');

const router = express.Router();

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

router.post('/send-email', async (req, res) => {
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
  } = req.body || {};

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

    const escapeHtml = (value) =>
      String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

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
    const invoiceLabel =
      typeof invoiceNumber === 'string' && invoiceNumber.trim() ? escapeHtml(invoiceNumber.trim()) : 'Invoice';
    const headerColor =
      typeof invoiceBackgroundColor === 'string' && invoiceBackgroundColor.trim()
        ? escapeHtml(invoiceBackgroundColor.trim())
        : '#0f172a';
    const brandColorHeader = headerColor;
    const safeLogoUrl = typeof logoUrl === 'string' && logoUrl.trim() ? escapeHtml(logoUrl.trim()) : '';
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
    const bannerCtaText =
      typeof bannerData.ctaText === 'string' && bannerData.ctaText.trim()
        ? escapeHtml(bannerData.ctaText.trim())
        : '';
    const bannerCtaLink =
      typeof bannerData.ctaLink === 'string' && bannerData.ctaLink.trim()
        ? escapeHtml(bannerData.ctaLink.trim())
        : '';

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
                ${safeLogoUrl ? `<img src="${safeLogoUrl}" alt="Brand Logo" style="height:40px;width:auto;border-radius:6px;display:block;" />` : ''}
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
          ${bannerEnabled ? `<tr>
            <td style="padding:0 20px 20px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${bannerBg};color:${bannerTextColor};border-radius:10px;overflow:hidden;">
                <tr>
                  <td style="padding:18px;text-align:left;">
                    <div style="font-size:14px;font-weight:700;margin-bottom:8px;color:${bannerTextColor};">Special Offer</div>
                    <div style="font-size:16px;line-height:1.5;color:${bannerTextColor};">${bannerText}</div>
                    ${bannerCtaText ? `<div style="margin-top:12px;">
                      <a href="${bannerCtaLink || '#'}" style="display:inline-block;padding:10px 16px;background:${bannerTextColor};color:${bannerBg};text-decoration:none;font-weight:700;border-radius:6px;">${bannerCtaText}</a>
                    </div>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>` : ''}
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

module.exports = router;
