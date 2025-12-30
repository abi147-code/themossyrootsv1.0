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

const resolveHost = () =>
  firstStringEnv('MAILPIT_HOST', 'SMTP_HOST', 'SMTP_SERVER') || '127.0.0.1';

const resolvePort = () => {
  const candidates = [
    process.env.MAILPIT_PORT,
    process.env.SMTP_PORT,
    process.env.SMTP_SERVER_PORT,
  ];
  for (const candidate of candidates) {
    const parsed = parseNumber(candidate, NaN);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return 1025;
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

const resolveEmailService = () => {
  const service =
    process.env.EMAIL_TRANSPORT ||
    process.env.EMAIL_SERVICE ||
    process.env.SMTP_SERVICE ||
    'mailpit';
  return typeof service === 'string' ? service.trim().toLowerCase() : 'mailpit';
};

const resolveCustomSmtpHost = () =>
  firstStringEnv('SMTP_HOST', 'SMTP_SERVER', 'SMTP_URL', 'EMAIL_SMTP_HOST');

const SENDGRID_API_HOST = 'api.sendgrid.com';

const resolveSendgridApiKey = () =>
  firstStringEnv('SENDGRID_API_KEY', 'EMAIL_SENDGRID_API_KEY', 'SENDGRID_KEY');

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

const buildMailpitConfig = () => ({
  host: resolveHost(),
  port: resolvePort(),
  secure: false,
  auth: resolveAuth(),
});

const buildCustomConfig = () => {
  const host = resolveCustomSmtpHost();
  if (!host) {
    return null;
  }

  const portCandidates = [
    process.env.SMTP_PORT,
    process.env.SMTP_SERVER_PORT,
    process.env.EMAIL_SMTP_PORT,
  ];
  let port = 587;
  for (const candidate of portCandidates) {
    const parsed = parseNumber(candidate, NaN);
    if (!Number.isNaN(parsed)) {
      port = parsed;
      break;
    }
  }

  const secure = parseBoolean(
    process.env.SMTP_SECURE ??
      process.env.EMAIL_SECURE ??
      process.env.SMTP_USE_TLS ??
      process.env.SMTP_TLS ??
      process.env.EMAIL_SMTP_SECURE,
    port === 465
  );

  const auth = resolveAuth();
  const config = {
    host,
    port,
    secure,
  };

  if (auth) {
    config.auth = auth;
  }

  if (port === 587 && !secure) {
    config.requireTLS = true;
  }

  return config;
};

const buildGmailConfig = () => {
  const host = (process.env.SMTP_HOST && process.env.SMTP_HOST.trim()) || 'smtp.gmail.com';
  const port = parseNumber(process.env.SMTP_PORT, 465);
  const secure = parseBoolean(process.env.SMTP_SECURE || process.env.EMAIL_SECURE, port === 465);
  const user =
    process.env.EMAIL_USER ||
    process.env.SMTP_USER ||
    process.env.SMTP_USERNAME ||
    process.env.SMTP_LOGIN ||
    null;
  const pass =
    process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.SMTP_PASSWORD || null;

  if (!user || !pass) {
    console.warn(
      '[Mailer] Gmail selected but EMAIL_USER/EMAIL_PASS are not fully configured. Emails may fail to send.'
    );
  }

  const config = {
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  };

  if (port === 587 && !secure) {
    config.requireTLS = true;
  }

  return config;
};

const FALLBACK_SENDER = 'no-reply@localhost.localdomain';
let activeTransportMeta = {
  host: '127.0.0.1',
  port: 1025,
  secure: false,
  mode: 'MAILPIT',
};

const resolveDefaultSender = () =>
  firstStringEnv('SMTP_FROM', 'SYSTEM_EMAIL', 'SMTP_USER') || FALLBACK_SENDER;

const resolveEnvelopeFrom = () =>
  firstStringEnv('SYSTEM_EMAIL', 'SMTP_USER', 'MAILPIT_USER') || resolveDefaultSender();

const getActiveTransportMeta = () => ({ ...activeTransportMeta });

const createTransporter = () => {
  const service = resolveEmailService();
  if (service === 'sendgrid') {
    const sendgridTransport = buildSendgridTransport();
    if (sendgridTransport) {
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
    }

    const error = new Error(
      '[Mailer] EMAIL_TRANSPORT=sendgrid configured but SENDGRID_API_KEY is missing.'
    );
    console.error(error.message);
    throw error;
  }

  const customConfig = buildCustomConfig();

  if (process.env.NODE_ENV === 'production' && service === 'mailpit' && !customConfig) {
    const error = new Error(
      '[Mailer] Mailpit is not allowed in production. Configure SMTP/SendGrid and set EMAIL_TRANSPORT accordingly.'
    );
    console.error(error.message);
    throw error;
  }

  let transportConfig;
  let modeLabel = 'MAILPIT';

  if (customConfig) {
    transportConfig = customConfig;
    modeLabel = `CUSTOM (${transportConfig.host})`;
  } else if (service === 'gmail') {
    transportConfig = buildGmailConfig();
    modeLabel = 'GMAIL';
  } else {
    transportConfig = buildMailpitConfig();
  }

  const transport = nodemailer.createTransport(transportConfig);
  activeTransportMeta = {
    host: transportConfig.host,
    port: transportConfig.port,
    secure: Boolean(transportConfig.secure),
    mode: modeLabel,
  };

  console.info(
    `[Mailer] Using SMTP host ${transportConfig.host}:${transportConfig.port} (secure=${
      transportConfig.secure ? 'yes' : 'no'
    })`
  );

  transport
    .verify()
    .then(() => {
      console.info(
        `[Mailer] ${modeLabel} SMTP ready at ${transportConfig.host}:${transportConfig.port}${
          transportConfig.auth ? ' (auth enabled)' : ''
        }`
      );
    })
    .catch((error) => {
      console.warn(
        `[Mailer] ${modeLabel} SMTP verify failed for ${transportConfig.host}:${transportConfig.port}:`,
        error?.message || error
      );
    });

  return transport;
};

const sharedTransporter = createTransporter();

module.exports = {
  sharedTransporter,
  createTransporter,
  resolveHost,
  resolvePort,
  resolveEmailService,
  resolveDefaultSender,
  resolveEnvelopeFrom,
  getActiveTransportMeta,
  resolveCustomSmtpHost,
};
