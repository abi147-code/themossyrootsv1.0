const nodemailer = require('nodemailer');

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

const resolveSendgridApiKey = () =>
  firstStringEnv('SENDGRID_API_KEY', 'EMAIL_SENDGRID_API_KEY', 'SENDGRID_KEY');

const buildSendgridConfig = () => {
  const apiKey = resolveSendgridApiKey();
  if (!apiKey) {
    return null;
  }

  const host =
    (typeof process.env.SENDGRID_SMTP_HOST === 'string' &&
      process.env.SENDGRID_SMTP_HOST.trim()) ||
    'smtp.sendgrid.net';
  const port = parseNumber(process.env.SENDGRID_SMTP_PORT, 587);
  const secure = parseBoolean(process.env.SENDGRID_SMTP_SECURE, port === 465);
  const user = process.env.SENDGRID_SMTP_USER || 'apikey';

  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass: apiKey,
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

  let transportConfig = null;
  let modeLabel = 'MAILPIT';

  if (service === 'sendgrid') {
    const sendgridConfig = buildSendgridConfig();
    if (sendgridConfig) {
      transportConfig = sendgridConfig;
      modeLabel = 'SENDGRID';
    } else {
      console.warn(
        '[Mailer] EMAIL_TRANSPORT=sendgrid configured but SENDGRID_API_KEY is missing. Falling back to default SMTP transport.'
      );
    }
  }

  if (!transportConfig) {
    const customConfig = buildCustomConfig();
    if (customConfig) {
      transportConfig = customConfig;
      modeLabel = `CUSTOM (${transportConfig.host})`;
    } else if (service === 'gmail') {
      transportConfig = buildGmailConfig();
      modeLabel = 'GMAIL';
    } else {
      transportConfig = buildMailpitConfig();
    }
  }

  const transport = nodemailer.createTransport(transportConfig);
  activeTransportMeta = {
    host: transportConfig.host,
    port: transportConfig.port,
    secure: Boolean(transportConfig.secure),
    mode: modeLabel,
  };

  if (modeLabel === 'SENDGRID') {
    console.info(
      `[Mailer] Using SendGrid API transport (${transportConfig.host}:${transportConfig.port}, secure=${
        transportConfig.secure ? 'yes' : 'no'
      })`
    );
  } else {
    console.info(
      `[Mailer] Using SMTP host ${transportConfig.host}:${transportConfig.port} (secure=${
        transportConfig.secure ? 'yes' : 'no'
      })`
    );
  }

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
