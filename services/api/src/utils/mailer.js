const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

const parseNumber = (value, fallback) => {
  const candidate = Number(value);
  return Number.isFinite(candidate) && candidate > 0 ? candidate : fallback;
};

const parseBoolean = (value, fallback) => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'off'].includes(normalized)) {
      return false;
    }
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return fallback;
};

const firstStringEnv = (...keys) => {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }
  return undefined;
};

const resolveAuth = () => {
  const user =
    process.env.MAILPIT_USER ||
    process.env.SMTP_USER ||
    process.env.SMTP_USERNAME ||
    process.env.SMTP_LOGIN ||
    null;
  const pass =
    process.env.MAILPIT_PASSWORD ||
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    null;

  if (user && pass) {
    return { user, pass };
  }
  return undefined;
};

const resolveEmailService = () => 'sendgrid';

const SENDGRID_API_HOST = 'api.sendgrid.com';

const resolveSendgridApiKey = () =>
  firstStringEnv('SENDGRID_API_KEY', 'EMAIL_SENDGRID_API_KEY', 'SENDGRID_KEY');

const assertSendgridConfig = () => {
  const transport = (process.env.EMAIL_TRANSPORT || process.env.EMAIL_SERVICE || '').trim().toLowerCase();
  if (transport && transport !== 'sendgrid') {
    throw new Error('EMAIL_TRANSPORT must be set to "sendgrid". Mailpit/SMTP are not allowed.');
  }

  if (!resolveSendgridApiKey()) {
    throw new Error('SENDGRID_API_KEY is required for SendGrid transport.');
  }

  if (!firstStringEnv('SYSTEM_EMAIL', 'SMTP_FROM', 'SMTP_USER')) {
    throw new Error('SYSTEM_EMAIL (verified sender) is required for SendGrid transport.');
  }
};

const normalizeAddressObject = (entry) => {
  if (!entry) {
    return null;
  }

  if (typeof entry === 'string') {
    const trimmed = entry.trim();
    if (!trimmed) {
      return null;
    }

    const match = trimmed.match(/^(.*)<([^<>]+)>$/);
    if (match) {
      const name = match[1].trim().replace(/^"|"$/g, '');
      const email = match[2].trim();
      if (!email) {
        return null;
      }
      return name ? { email, name } : { email };
    }

    return { email: trimmed };
  }

  if (typeof entry === 'object') {
    const emailCandidate =
      (typeof entry.email === 'string' && entry.email.trim()) ||
      (typeof entry.address === 'string' && entry.address.trim());
    if (!emailCandidate) {
      return null;
    }

    const recipient = { email: emailCandidate };
    if (typeof entry.name === 'string' && entry.name.trim()) {
      recipient.name = entry.name.trim();
    }
    return recipient;
  }

  return null;
};

const normalizeRecipientList = (value) => {
  if (!value) {
    return [];
  }
  const list = Array.isArray(value) ? value : [value];
  return list.map(normalizeAddressObject).filter((entry) => entry && entry.email);
};

const normalizeSingleAddress = (value, fallbackEmail) => {
  const [first] = normalizeRecipientList(value);
  if (first) {
    return first;
  }
  if (fallbackEmail) {
    return { email: fallbackEmail };
  }
  return null;
};

const encodeAttachmentContent = (content, encoding) => {
  if (!content) {
    return null;
  }

  if (Buffer.isBuffer(content)) {
    return content.toString('base64');
  }

  if (typeof content === 'string') {
    if (encoding === 'base64') {
      return content;
    }
    return Buffer.from(content, encoding || 'utf8').toString('base64');
  }

  try {
    return Buffer.from(content).toString('base64');
  } catch (_error) {
    return null;
  }
};

const buildSendgridAttachments = (attachments) => {
  if (!Array.isArray(attachments) || !attachments.length) {
    return [];
  }

  return attachments
    .map((attachment, index) => {
      if (!attachment) {
        return null;
      }

      const encodedContent = encodeAttachmentContent(attachment.content, attachment.encoding);
      if (!encodedContent) {
        return null;
      }

      const isInline = Boolean(attachment.cid || attachment.contentId);

      const safeFilename =
        (typeof attachment.filename === 'string' && attachment.filename.trim()) ||
        `attachment-${index + 1}`;

      return {
        filename: safeFilename,
        type: attachment.contentType || attachment.content_type || 'application/octet-stream',
        content: encodedContent,
        disposition:
          attachment.contentDisposition ||
          attachment.disposition ||
          (isInline ? 'inline' : 'attachment'),
        ...(isInline
          ? { content_id: attachment.cid || attachment.contentId || undefined }
          : {}),
      };
    })
    .filter(Boolean);
};

const buildSendgridTransport = () => {
  const apiKey = resolveSendgridApiKey();
  if (!apiKey) {
    return null;
  }

  sgMail.setApiKey(apiKey);

  return {
    async sendMail(options = {}) {
      const envelope = options.envelope || {};

      const toRecipients = normalizeRecipientList(envelope.to || options.to);
      const ccRecipients = normalizeRecipientList(options.cc);
      const bccRecipients = normalizeRecipientList(options.bcc);

      if (!toRecipients.length && !ccRecipients.length && !bccRecipients.length) {
        throw new Error('[Mailer] SendGrid transport requires at least one recipient.');
      }

      const fromAddress =
        normalizeSingleAddress(envelope.from || options.from, resolveDefaultSender()) ||
        { email: resolveDefaultSender() };

      const personalization = {};
      if (toRecipients.length) personalization.to = toRecipients;
      if (ccRecipients.length) personalization.cc = ccRecipients;
      if (bccRecipients.length) personalization.bcc = bccRecipients;

      const message = {
        from: fromAddress,
        subject: options.subject,
        text: options.text,
        html: options.html,
        personalizations: [personalization],
      };

      const replyToAddress = normalizeSingleAddress(options.replyTo);
      if (replyToAddress) {
        message.replyTo = replyToAddress;
      }

      if (options.headers && typeof options.headers === 'object') {
        message.headers = options.headers;
      }

      const attachments = buildSendgridAttachments(options.attachments);
      if (attachments.length) {
        message.attachments = attachments;
      }

      const sendResult = await sgMail.send(message);
      const [response] = Array.isArray(sendResult) ? sendResult : [sendResult];
      const headers = (response && response.headers) || {};

      const messageId =
        headers['x-message-id'] ||
        headers['X-Message-Id'] ||
        headers['X-Message-ID'] ||
        headers['x-message_id'] ||
        null;

      const acceptedRecipients = [...toRecipients, ...ccRecipients, ...bccRecipients].map(
        (recipient) => recipient.email
      );

      return {
        messageId,
        accepted: acceptedRecipients,
        rejected: [],
        response: response?.statusCode,
      };
    },
    async verify() {
      return true;
    },
  };
};

const FALLBACK_SENDER = 'no-reply@localhost.localdomain';
let activeTransportMeta = {
  host: SENDGRID_API_HOST,
  port: 443,
  secure: true,
  mode: 'SENDGRID_WEBAPI',
};

const resolveDefaultSender = () =>
  firstStringEnv('SYSTEM_EMAIL', 'SMTP_FROM', 'SMTP_USER') || FALLBACK_SENDER;

const resolveEnvelopeFrom = () =>
  firstStringEnv('SYSTEM_EMAIL', 'SMTP_FROM', 'SMTP_USER') || resolveDefaultSender();

const getActiveTransportMeta = () => ({ ...activeTransportMeta });

const createTransporter = () => {
  assertSendgridConfig();

  const sendgridTransport = buildSendgridTransport();
  if (!sendgridTransport) {
    const error = new Error('[Mailer] SENDGRID_API_KEY is missing or invalid.');
    console.error(error.message);
    throw error;
  }

  activeTransportMeta = {
    host: SENDGRID_API_HOST,
    port: 443,
    secure: true,
    mode: 'SENDGRID_WEBAPI',
  };

  console.info('[Mailer] Using SendGrid Web API (HTTPS)');
  sendgridTransport
    .verify()
    .then(() => {
      console.info('[Mailer] SendGrid Web API transport ready');
    })
    .catch((error) => {
      console.warn('[Mailer] SendGrid transport verification skipped:', error?.message || error);
    });

  return sendgridTransport;
};

const sharedTransporter = createTransporter();

module.exports = {
  sharedTransporter,
  createTransporter,
  resolveEmailService,
  resolveDefaultSender,
  resolveEnvelopeFrom,
  getActiveTransportMeta,
};
