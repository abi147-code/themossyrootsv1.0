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
  const { html, invoiceNumber, toEmail, subject, message } = req.body || {};

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

    const fromAddress = resolveDefaultSender();
    const envelopeFrom = resolveEnvelopeFrom();

    await sharedTransporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject,
      html:
        typeof message === 'string' && message.trim()
          ? message
          : 'Please find your invoice attached.',
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
