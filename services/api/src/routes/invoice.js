const express = require('express');
const axios = require('axios');
const {
  sharedTransporter,
  resolveDefaultSender,
  resolveEnvelopeFrom,
  getActiveTransportMeta,
} = require('../utils/mailer');
const { buildInvoiceEmail } = require('../email/sendInvoiceEmail');

const router = express.Router();

const DEFAULT_INVOICE_API_URL = 'https://themossyrootsv1-0-3.onrender.com';
const INVOICE_API_URL = process.env.INVOICE_API_URL || DEFAULT_INVOICE_API_URL;
const AXIOS_JSON_CONFIG = {
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
};

// SMTP (Mailpit-friendly transporter)
const transporter = sharedTransporter;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const calculateInvoiceTotal = (payload) => {
  if (!payload || !Array.isArray(payload.items)) {
    return 0;
  }

  const subtotal = payload.items.reduce((sum, item) => {
    const quantity = toNumber(item?.quantity, 0);
    const price = toNumber(item?.price, 0);
    return sum + quantity * price;
  }, 0);

  const taxRate = toNumber(payload.taxRate, 0);
  const taxAmount = subtotal * (taxRate > 0 ? taxRate : 0);
  return subtotal + taxAmount;
};

const logFlaskError = (label, error) => {
  if (error.response) {
    console.error(
      `${label} (${error.response.status}):`,
      error.response.data || error.message
    );
  } else {
    console.error(`${label} (network):`, error?.message || error);
  }
};

const parseDispositionFilename = (headerValue) => {
  if (!headerValue || typeof headerValue !== 'string') {
    return null;
  }

  const utf8Match = headerValue.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match && utf8Match[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch (error) {
      console.warn('[Invoice] Could not decode UTF-8 filename from content-disposition:', error);
    }
  }

  const fallbackMatch = headerValue.match(/filename="?([^";]+)"?/i);
  if (fallbackMatch && fallbackMatch[1]) {
    return fallbackMatch[1];
  }

  return null;
};

const sanitizeFilename = (text, fallback = 'invoice.pdf') => {
  const candidate = typeof text === 'string' && text.trim() ? text.trim() : fallback;
  return candidate.replace(/[\\/:*?"<>|]/g, '_');
};

const resolveInvoiceId = (payload) =>
  payload?.invoice_id ||
  payload?.invoiceId ||
  payload?.invoiceNumber ||
  payload?.id ||
  'invoice';

const buildPdfRequestPayload = (source, { fontColor, pageColor, marketing } = {}) => {
  const payload = { data: source };

  if (fontColor && typeof fontColor === 'string' && fontColor.trim()) {
    payload.fontColor = fontColor.trim();
  }
  if (pageColor && typeof pageColor === 'string' && pageColor.trim()) {
    payload.pageColor = pageColor.trim();
  }
  if (marketing && typeof marketing === 'object') {
    payload.marketing = marketing;
  }

  return payload;
};

// ---- Health (Node side, protected by your auth middleware upstream) ----
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Invoice API router', target: INVOICE_API_URL });
});

// ---- Reach Flask microservice ----
router.get('/test', async (_req, res) => {
  try {
    const response = await axios.get(`${INVOICE_API_URL}/test`, { timeout: 5000 });
    return res.json({ status: 'ok', microservice: response.data || { message: 'reachable' } });
  } catch (err) {
    logFlaskError('[Invoice] /test failed', err);
    return res.status(502).json({ status: 'error', message: 'Flask invoice service unreachable' });
  }
});

// ---- Create summary via Flask ----
router.post('/summary', async (req, res) => {
  try {
    const response = await axios.post(
      `${INVOICE_API_URL}/summary`,
      req.body || {},
      AXIOS_JSON_CONFIG
    );
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      logFlaskError('[Invoice] /summary failed', err);
      return res.status(err.response.status).json(err.response.data);
    }
    logFlaskError('[Invoice] /summary failed', err);
    return res.status(502).json({ status: 'error', message: 'Failed to generate summary' });
  }
});

// ---- Standalone PDF generation ----
router.post('/generate-pdf', async (req, res) => {
  try {
    const pdfResponse = await axios.post(
      `${INVOICE_API_URL}/generate-pdf`,
      req.body || {},
      {
        ...AXIOS_JSON_CONFIG,
        responseType: 'arraybuffer',
      }
    );

    const dispositionHeader = pdfResponse.headers?.['content-disposition'];
    const resolvedName =
      parseDispositionFilename(dispositionHeader) ||
      `${resolveInvoiceId(req.body?.data || req.body)}.pdf`;
    const filename = sanitizeFilename(resolvedName);

    res.set({
      'Content-Type': pdfResponse.headers?.['content-type'] || 'application/pdf',
      'Content-Disposition':
        dispositionHeader || `attachment; filename="${filename}"`,
      ...(pdfResponse.headers?.['content-length']
        ? { 'Content-Length': pdfResponse.headers['content-length'] }
        : {}),
    });

    return res.status(pdfResponse.status).send(Buffer.from(pdfResponse.data));
  } catch (err) {
    logFlaskError('[Invoice] /generate-pdf failed', err);
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(502).json({ message: 'Failed to generate invoice PDF.' });
  }
});

// ---- Send invoice email: generate summary HTML via Flask ----
router.post('/send', async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user?.id;
  const body = req.body || {};

  const {
    to,
    subject = 'Your invoice from TMR',
    summaryPayload,
    pdfPayload,
    html,
    fontColor: fontColorCamel,
    font_color: fontColorSnake,
    pageColor: pageColorCamel,
    page_color: pageColorSnake,
    marketing,
    attachmentName: attachmentNameCamel,
    attachment_name: attachmentNameSnake,
  } = body;

  if (!to) return res.status(400).json({ message: 'Recipient (to) is required.' });
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const summarySource = summaryPayload || pdfPayload;
    if (!summarySource || typeof summarySource !== 'object') {
      return res.status(400).json({
        message: 'summaryPayload or pdfPayload is required to build the invoice PDF attachment.',
      });
    }

    const fontOverride = fontColorCamel || fontColorSnake || null;
    const pageOverride = pageColorCamel || pageColorSnake || null;
    const attachmentNameOverride = attachmentNameCamel || attachmentNameSnake || null;

    let summaryResponse = null;
    let templateAttachments = [];
    let emailHtml = null;

    try {
      const templateResult = await buildInvoiceEmail({
        invoice: summarySource,
        marketing,
        primaryColor: body.primaryColor || body.primary_color || null,
        paymentTerm: summarySource?.paymentTerm || summarySource?.payment_term || null,
        dueDate: summarySource?.dueDate || summarySource?.due_date || null,
        currency: body.currency || summarySource?.currency || summarySource?.currency_code,
        invoiceUrl:
          body.invoiceUrl ||
          body.invoice_url ||
          summarySource?.invoiceUrl ||
          summarySource?.invoice_url ||
          null,
        unsubscribeLine: body.unsubscribeLine || body.unsubscribe_line || null,
      });
      emailHtml = templateResult?.html || null;
      templateAttachments = Array.isArray(templateResult?.attachments)
        ? templateResult.attachments
        : [];
    } catch (templateError) {
      console.error('[Invoice] Failed to render branded invoice email:', templateError);
    }

    if (!emailHtml && html) {
      emailHtml = html;
    }

    if (!emailHtml) {
      try {
        const summaryRequestPayload = {
          data: summarySource,
          ...(marketing && typeof marketing === 'object' ? { marketing } : {}),
        };
        const response = await axios.post(
          `${INVOICE_API_URL}/summary`,
          summaryRequestPayload,
          AXIOS_JSON_CONFIG
        );
        summaryResponse = response.data;
        emailHtml = summaryResponse?.html;
        if (!emailHtml || !emailHtml.trim()) {
          return res.status(502).json({ message: 'Invoice summary unavailable.' });
        }
      } catch (error) {
        if (error.response) {
          logFlaskError('[Invoice] /send summary failed', error);
          return res.status(error.response.status).json(error.response.data);
        }
        logFlaskError('[Invoice] /send summary failed', error);
        return res.status(502).json({ message: 'Failed to generate invoice summary.' });
      }
    }

    const pdfSource = pdfPayload || summarySource;

    let pdfBuffer = null;
    let pdfFilename = sanitizeFilename(
      attachmentNameOverride || `${resolveInvoiceId(pdfSource)}.pdf`
    );

    try {
      const pdfResponse = await axios.post(
        `${INVOICE_API_URL}/generate-pdf`,
        buildPdfRequestPayload(pdfSource, {
          fontColor: fontOverride,
          pageColor: pageOverride,
          marketing,
        }),
        {
          ...AXIOS_JSON_CONFIG,
          responseType: 'arraybuffer',
        }
      );
      pdfBuffer = Buffer.from(pdfResponse.data);
      if (!pdfBuffer?.length) {
        throw new Error('Empty PDF response from invoice service.');
      }
      const dispositionHeader = pdfResponse.headers?.['content-disposition'];
      const resolvedName =
        parseDispositionFilename(dispositionHeader) || `${resolveInvoiceId(pdfSource)}.pdf`;
      pdfFilename = sanitizeFilename(attachmentNameOverride || resolvedName);
    } catch (error) {
      logFlaskError('[Invoice] /send PDF generation failed', error);
      return res.status(502).json({ message: 'Failed to generate invoice PDF.' });
    }

    const fromAddress = resolveDefaultSender();
    const envelopeFrom = resolveEnvelopeFrom();
    const activeTransport = getActiveTransportMeta();

    console.info(
      `[Mailer] Sending invoice via ${activeTransport.host}:${activeTransport.port} from ${fromAddress}`
    );

    const sent = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html: emailHtml,
      envelope: {
        from: envelopeFrom,
        to: Array.isArray(to) ? to : [to],
      },
      attachments: [
        ...(Array.isArray(templateAttachments) ? templateAttachments : []),
        {
          filename: pdfFilename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    console.info('✅ Invoice attached and sent successfully', {
      to,
      invoiceId: resolveInvoiceId(pdfSource),
      messageId: sent?.messageId || null,
      attachment: pdfFilename,
    });

    let auditId = null;
    let historyId = null;
    try {
      const rec = await prisma.invoiceEmailSend.create({
        data: {
          userId,
          to,
          subject,
          providerId: sent?.messageId || null,
          sentAt: new Date(),
        },
      });
      auditId = rec?.id ?? null;
    } catch (_) {}

    try {
      const summaryBasis = summarySource;
      const totalAmount = calculateInvoiceTotal(summaryBasis);
      const summaryData = summaryResponse
        ? {
            summary: summaryResponse?.summary ?? null,
            follow_up_email: summaryResponse?.follow_up_email ?? null,
            next_step: summaryResponse?.next_step ?? null,
          }
        : null;

      const historyRecord = await prisma.invoiceHistory.create({
        data: {
          userId,
          customerName: summaryBasis?.customer?.name || 'Unknown customer',
          customerEmail: summaryBasis?.customer?.email || null,
          recipient: to,
          subject,
          totalAmount: totalAmount.toFixed(2),
          status: 'sent',
          summary: summaryData || (summaryBasis ? { payload: summaryBasis } : null),
          sentAt: new Date(),
        },
      });
      historyId = historyRecord.id;
    } catch (historyError) {
      console.error('[Invoice] Failed to persist invoice history:', historyError);
    }

    return res.json({
      status: 'ok',
      message: 'Invoice email sent.',
      provider: { messageId: sent?.messageId },
      auditId,
      historyId,
      html: emailHtml,
      summary: summaryResponse?.summary,
    });
  } catch (err) {
    const activeTransport = getActiveTransportMeta();
    console.error(
      `[Mailer] Invoice send failed via ${activeTransport.host}:${activeTransport.port} (secure=${
        activeTransport.secure ? 'yes' : 'no'
      })`,
      err?.message || err
    );
    console.error('[Invoice] /send failed:', err);
    const errorMessage = String(err?.message || '').toLowerCase();
    if (
      errorMessage.includes('connection') ||
      errorMessage.includes('enotfound') ||
      errorMessage.includes('econnrefused')
    ) {
      return res
        .status(502)
        .json({ message: 'Unable to reach SMTP server. Check Mailpit configuration.' });
    }
    return res.status(500).json({ message: 'Failed to send invoice email.' });
  }
});

module.exports = router;
