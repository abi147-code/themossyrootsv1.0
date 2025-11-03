const fs = require('fs');
const path = require('path');
const { resolveAssetDiskPath } = require('../utils/avatar');

let dataUriToBufferFn = null;
const getDataUriToBuffer = async () => {
  if (!dataUriToBufferFn) {
    const mod = await import('data-uri-to-buffer');
    dataUriToBufferFn = mod.default || mod.dataUriToBuffer;
    if (typeof dataUriToBufferFn !== 'function') {
      throw new Error('[Email] data-uri-to-buffer module did not provide a callable export.');
    }
  }
  return dataUriToBufferFn;
};



const TEMPLATE_PATH = path.join(__dirname, 'templates', 'invoiceEmail.html');

const DEFAULT_PRIMARY_COLOR = '#2563eb';
const DEFAULT_PAGE_COLOR = '#f1f5f9';
const DEFAULT_FONT_COLOR = '#0f172a';
const DEFAULT_FONT_FAMILY = "'Segoe UI', Arial, sans-serif";

let cachedTemplate = null;

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
const DATA_URL_PATTERN = /^data:/i;
const CID_URL_PATTERN = /^cid:/i;
const MAX_INLINE_ATTACHMENT_BYTES = 200 * 1024; // 200 KB per inline asset
const MAX_HTML_SIZE_BYTES = 20 * 1024 * 1024; // Gmail overall limit is ~25 MB

const KNOWN_IMAGE_MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const MIME_EXTENSION_MAP = Object.entries(KNOWN_IMAGE_MIME).reduce((acc, [ext, mime]) => {
  acc[mime] = ext.replace('.', '');
  return acc;
}, {});

const sanitizeBaseUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }
  try {
    const url = new URL(value.trim());
    if (!/^https?:$/i.test(url.protocol)) {
      return null;
    }
    const pathname = url.pathname.replace(/\/+$/, '');
    return `${url.origin}${pathname === '/' ? '' : pathname}`;
  } catch (_error) {
    return null;
  }
};

const resolveDefaultApiPort = () => {
  const candidate = Number(process.env.API_PORT || process.env.PORT || 4000);
  return Number.isFinite(candidate) && candidate > 0 ? candidate : 4000;
};

const API_PUBLIC_BASE =
  sanitizeBaseUrl(
    process.env.API_PUBLIC_URL ||
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.WEB_PUBLIC_API_URL
  ) || `http://localhost:${resolveDefaultApiPort()}`;

const toAbsoluteUploadUrl = (ref, base = API_PUBLIC_BASE) => {
  if (!ref || DATA_URL_PATTERN.test(ref) || CID_URL_PATTERN.test(ref)) {
    return ref;
  }

  if (ABSOLUTE_URL_PATTERN.test(ref)) {
    return ref;
  }

  if (typeof ref !== 'string') {
    return ref;
  }

  let normalized = ref.trim();
  if (!normalized) {
    return ref;
  }

  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  if (!normalized.startsWith('/uploads/')) {
    return ref;
  }

  return `${base}${normalized}`;
};

const loadTemplate = () => {
  if (!cachedTemplate) {
    cachedTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  }
  return cachedTemplate;
};

const guessMimeType = (filepath) => {
  if (!filepath) return 'application/octet-stream';
  const ext = path.extname(filepath).toLowerCase();
  return KNOWN_IMAGE_MIME[ext] || 'application/octet-stream';
};

const resolveDiskPathForAsset = (assetRef) => {
  if (!assetRef || DATA_URL_PATTERN.test(assetRef)) {
    return null;
  }

  let candidate = assetRef;

  if (ABSOLUTE_URL_PATTERN.test(assetRef)) {
    try {
      const url = new URL(assetRef);
      candidate = url.pathname || assetRef;
    } catch (_error) {
      return null;
    }
  }

  if (!candidate.startsWith('/')) {
    candidate = `/${candidate}`;
  }

  if (!candidate.startsWith('/uploads/')) {
    return null;
  }

  return resolveAssetDiskPath(candidate);
};

const generateCid = (prefix = 'asset') =>
  `${prefix}-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}@tmr`;

const getExtensionFromMime = (mimeType) => {
  if (!mimeType) return 'bin';
  const normalized = mimeType.toLowerCase();
  if (MIME_EXTENSION_MAP[normalized]) {
    return MIME_EXTENSION_MAP[normalized];
  }
  const slashIndex = normalized.indexOf('/');
  if (slashIndex !== -1) {
    return normalized.slice(slashIndex + 1).split(';')[0];
  }
  return 'bin';
};

const ensureInlineCid = async (assetRef, cidBase, attachments, cache) => {
  if (!assetRef) {
    return { src: null };
  }

  if (cache && cache.has(assetRef)) {
    return cache.get(assetRef);
  }

  const result = { src: assetRef };

  try {
    const diskPath = resolveDiskPathForAsset(assetRef);
    if (diskPath) {
      const stats = fs.statSync(diskPath);
      if (stats.isFile()) {
        if (stats.size <= MAX_INLINE_ATTACHMENT_BYTES) {
          const cid = generateCid(cidBase);
          attachments.push({
            filename: path.basename(diskPath),
            path: diskPath,
            cid,
            contentType: guessMimeType(diskPath),
          });
          result.src = 'cid:' + cid;
        } else {
          console.warn(
            `[Email] Skipping inline attachment ${diskPath} (${stats.size} bytes) — exceeds inline limit.`
          );
        }
      }

      if (cache) {
        cache.set(assetRef, result);
      }
      return result;
    }

    if (DATA_URL_PATTERN.test(assetRef)) {
      const dataUriToBuffer = await getDataUriToBuffer();
      const parsed = dataUriToBuffer(assetRef);
      const buffer = Buffer.isBuffer(parsed) ? parsed : Buffer.from(parsed);
      if (buffer.length <= MAX_INLINE_ATTACHMENT_BYTES) {
        const mimeType = parsed.typeFull || parsed.type || 'application/octet-stream';
        const extension = getExtensionFromMime(mimeType);
        const cid = generateCid(cidBase);
        attachments.push({
          filename: cidBase + '.' + extension,
          content: buffer,
          cid,
          contentType: mimeType,
        });
        result.src = 'cid:' + cid;
      } else {
        console.warn(
          `[Email] Skipping inline attachment (data URI) — ${buffer.length} bytes exceeds inline limit.`
        );
      }

      if (cache) {
        cache.set(assetRef, result);
      }
      return result;
    }
  } catch (error) {
    console.warn('[Email] Failed to create inline attachment:', error?.message || error);
  }

  if (cache) {
    cache.set(assetRef, result);
  }
  return result;
};

const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const sanitizeColor = (value, fallback) => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) {
    return trimmed.length === 4
      ? `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`
      : trimmed;
  }
  const rgbMatch = trimmed.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|0?\.\d+|1))?\s*\)$/i
  );
  if (rgbMatch) {
    const [r, g, b] = rgbMatch.slice(1, 4).map((component) => {
      const channel = Number(component);
      return Number.isFinite(channel) ? Math.max(0, Math.min(255, channel)) : 0;
    });
    return `rgb(${r}, ${g}, ${b})`;
  }
  return fallback;
};

const parseColorToRgb = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  const hexMatch = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    let hex = hexMatch[1].toLowerCase();
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => `${char}${char}`)
        .join('');
    }
    const intVal = parseInt(hex, 16);
    return {
      r: (intVal >> 16) & 255,
      g: (intVal >> 8) & 255,
      b: intVal & 255,
    };
  }
  const rgbMatch = trimmed.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|0?\.\d+|1))?\s*\)$/i
  );
  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    };
  }
  return null;
};

const getRelativeLuminance = (color) => {
  const rgb = parseColorToRgb(color);
  if (!rgb) return 0;
  const normalize = (channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const r = normalize(rgb.r);
  const g = normalize(rgb.g);
  const b = normalize(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const pickReadableTextColor = (background, preferred = DEFAULT_FONT_COLOR) => {
  const bgLuminance = getRelativeLuminance(background);
  const preferredLuminance = getRelativeLuminance(preferred);
  const contrastPreferred =
    (Math.max(bgLuminance, preferredLuminance) + 0.05) /
    (Math.min(bgLuminance, preferredLuminance) + 0.05);
  if (contrastPreferred >= 4.5) {
    return preferred;
  }
  const alternative = preferred === '#ffffff' ? '#0f172a' : '#ffffff';
  const altLuminance = getRelativeLuminance(alternative);
  const contrastAlternative =
    (Math.max(bgLuminance, altLuminance) + 0.05) / (Math.min(bgLuminance, altLuminance) + 0.05);
  return contrastAlternative >= 4.5 ? alternative : preferred;
};

const adjustColor = (color, percent) => {
  const rgb = parseColorToRgb(color);
  if (!rgb) return color;
  const clamp = (value) => Math.max(0, Math.min(255, value));
  const factor = 1 + percent / 100;
  const r = clamp(Math.round(rgb.r * factor));
  const g = clamp(Math.round(rgb.g * factor));
  const b = clamp(Math.round(rgb.b * factor));
  return `rgb(${r}, ${g}, ${b})`;
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const calculateInvoiceTotal = (invoice) => {
  if (!invoice || !Array.isArray(invoice.items)) {
    return 0;
  }
  const subtotal = invoice.items.reduce((sum, item) => {
    const quantity = toNumber(item?.quantity, 0);
    const price = toNumber(item?.price, 0);
    return sum + quantity * price;
  }, 0);
  const taxRate = invoice.taxRate ?? invoice.tax_rate ?? 0;
  const normalizedTaxRate = toNumber(taxRate, 0);
  const rate = normalizedTaxRate > 1 ? normalizedTaxRate / 100 : normalizedTaxRate;
  return subtotal + subtotal * Math.max(0, rate);
};

const formatCurrency = (amount, currencyCode) => {
  const currency =
    typeof currencyCode === 'string' && currencyCode.trim()
      ? currencyCode.trim().toUpperCase()
      : 'USD';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch (_) {
    return Number.isFinite(amount) ? amount.toFixed(2) : escapeHtml(String(amount));
  }
};

const formatDate = (value) => {
  if (!value) return 'upon receipt';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return escapeHtml(String(value));
  }
  return parsed.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const pickFirstString = (...candidates) => {
  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed) return trimmed;
    }
  }
  return null;
};

const resolveBusinessName = (invoice) =>
  pickFirstString(
    invoice?.business_name,
    invoice?.businessName,
    invoice?.organization?.name,
    invoice?.from_name,
    invoice?.fromName,
    invoice?.brand?.name,
    invoice?.company?.name
  ) || 'Your business';

const resolveInvoiceId = (invoice) =>
  pickFirstString(
    invoice?.invoice_id,
    invoice?.invoiceId,
    invoice?.invoiceNumber,
    invoice?.id,
    invoice?.number
  ) || 'invoice';

const resolveCustomerName = (invoice) =>
  pickFirstString(
    invoice?.customer?.name,
    invoice?.customer_name,
    invoice?.to_name,
    invoice?.recipient?.name
  ) || 'there';

const resolveFontFamily = (invoice, marketing) =>
  pickFirstString(
    invoice?.font_family,
    invoice?.fontFamily,
    invoice?.branding?.fontFamily,
    invoice?.styles?.fontFamily,
    marketing?.fontFamily,
    marketing?.font_family,
    DEFAULT_FONT_FAMILY
  );

const resolveFontColor = (invoice, marketing, overrides) =>
  sanitizeColor(
    pickFirstString(
      overrides?.fontColor,
      overrides?.font_color,
      invoice?.font_color,
      invoice?.fontColor,
      invoice?.branding?.fontColor,
      invoice?.styles?.fontColor,
      invoice?.colors?.text,
      marketing?.fontColor,
      marketing?.font_color
    ),
    DEFAULT_FONT_COLOR
  );

const resolvePrimaryColor = (invoice, marketing, overrides) =>
  sanitizeColor(
    pickFirstString(
      overrides?.primaryColor,
      overrides?.primary_color,
      invoice?.primaryColor,
      invoice?.primary_color,
      invoice?.branding?.primaryColor,
      invoice?.styles?.primaryColor,
      marketing?.accentColor,
      marketing?.accent_color
    ),
    DEFAULT_PRIMARY_COLOR
  );

const resolvePageColor = (invoice, marketing, overrides) =>
  sanitizeColor(
    pickFirstString(
      overrides?.pageColor,
      overrides?.page_color,
      invoice?.pageColor,
      invoice?.page_color,
      invoice?.theme?.pageColor,
      invoice?.branding?.pageColor,
      invoice?.styles?.pageColor,
      marketing?.backgroundColor,
      marketing?.background_color
    ),
    DEFAULT_PAGE_COLOR
  );

const resolveLogoUrl = (invoice) =>
  pickFirstString(
    invoice?.logo_url,
    invoice?.logoUrl,
    invoice?.logo,
    invoice?.organization?.logoUrl,
    invoice?.branding?.logo,
    invoice?.branding?.logoUrl
  );

const resolvePreviewUrl = (invoice, marketing) =>
  pickFirstString(
    invoice?.invoice_preview_url,
    invoice?.invoicePreviewUrl,
    invoice?.preview_url,
    invoice?.previewUrl,
    marketing?.invoicePreviewUrl,
    marketing?.invoice_preview_url
  );

const resolveMarketingPayload = (invoice, marketing) => {
  const source = marketing || invoice?.marketing || {};
  return {
    imageUrl: pickFirstString(
      source.bannerUrl,
      source.banner_url,
      invoice?.marketing_banner_url,
      invoice?.marketingBannerUrl,
      source.image,
      source.imageUrl,
      source.image_url
    ),
    backgroundImage: pickFirstString(
      source.backgroundImage,
      source.background_image,
      source.bannerBackground,
      source.banner_background,
      invoice?.marketing_banner_background,
      invoice?.marketingBannerBackground
    ),
    headline: pickFirstString(
      source.headline,
      source.title,
      source.heading,
      invoice?.marketing_headline
    ),
    message: pickFirstString(
      source.message,
      source.copy,
      source.text,
      invoice?.marketing_message
    ),
    backgroundColor: sanitizeColor(
      pickFirstString(
        source.backgroundColor,
        source.background_color,
        invoice?.marketing_background_color
      ),
      null
    ),
    ctaText: pickFirstString(
      source.ctaText,
      source.cta_text,
      source.ctaLabel,
      invoice?.marketing_cta_text
    ),
    ctaLink: pickFirstString(
      source.ctaLink,
      source.cta_link,
      source.ctaUrl,
      source.cta_url,
      invoice?.marketing_cta_link
    ),
  };
};

const resolveInvoiceDownloadUrl = (invoice, overrides, marketing) =>
  escapeHtml(
    pickFirstString(
      overrides?.invoice_download_url,
      overrides?.invoiceDownloadUrl,
      overrides?.invoiceUrl,
      overrides?.invoice_url,
      invoice?.invoice_download_url,
      invoice?.invoiceDownloadUrl,
      invoice?.invoice_url,
      invoice?.invoiceUrl,
      invoice?.links?.download,
      invoice?.links?.view,
      marketing?.ctaLink,
      marketing?.cta_link
    ) || '#'
  );

const buildLogoBlock = (logoUrl, businessName) => {
  if (!logoUrl) return '';
  return `<img src="${escapeHtml(
    logoUrl
  )}" alt="${escapeHtml(businessName)} logo" style="display:block; margin:0 auto 16px; max-width:160px; width:160px; height:auto; border-radius:16px;" />`;
};

const buildPreviewSection = (previewUrl, fontColor) => {
  if (!previewUrl) return '';
  return `<tr>
  <td style="padding:0 32px 24px; background-color:#ffffff;">
    <p style="margin:0 0 12px; font-size:14px; font-weight:600; text-align:center; color:${fontColor}; opacity:0.85;">Invoice preview</p>
    <img src="${escapeHtml(
      previewUrl
    )}" alt="Invoice preview image" style="display:block; width:100%; max-width:536px; margin:0 auto; border-radius:16px; box-shadow:0 10px 24px rgba(15,23,42,0.12);" />
  </td>
</tr>`;
};

const buildMarketingSection = ({
  marketing,
  pageColor,
  fontColor,
  primaryColor,
  invoiceDownloadUrl,
}) => {
  const {
    imageSrc,
    imageUrl,
    headline,
    message,
    backgroundColor,
    backgroundImage,
    ctaText,
    ctaLink,
  } = marketing;
  if (!imageSrc && !imageUrl && !headline && !message && !ctaText) {
    return '';
  }

  const bannerSrc = imageSrc || imageUrl;
  const surfaceColor = backgroundColor || pageColor || DEFAULT_PAGE_COLOR;
  const headlineColor = pickReadableTextColor(surfaceColor, fontColor);
  const bodyColor = pickReadableTextColor(surfaceColor, adjustColor(headlineColor, 10));

  const buttonLabel = ctaText ? escapeHtml(ctaText) : 'View invoice';
  const buttonLink = escapeHtml(ctaLink || invoiceDownloadUrl || '#');

  const buttonBackground = adjustColor(surfaceColor, -25);
  const buttonTextColor = pickReadableTextColor(buttonBackground, '#ffffff');
  const buttonBorder = adjustColor(surfaceColor, -35);
  const buttonShadow = '0 16px 32px rgba(15,23,42,0.18)';

  const normalizedBannerSrc = (bannerSrc || '').trim();
  const normalizedBackgroundSrc = (backgroundImage || '').trim();
  const shouldRenderBannerImg =
    normalizedBannerSrc &&
    (!normalizedBackgroundSrc || normalizedBannerSrc !== normalizedBackgroundSrc);

  const bannerBlock = shouldRenderBannerImg
    ? `<div style="margin:0 auto 28px; max-width:560px;"><img src="${escapeHtml(
        normalizedBannerSrc
      )}" alt="${escapeHtml(headline || 'Marketing banner')}" style="width:100%; display:block; border-radius:24px;" /></div>`
    : '';

  const headlineBlock = headline
    ? `<p style="margin:0 0 12px; font-size:18px; font-weight:600; color:${headlineColor};">${escapeHtml(
        headline
      )}</p>`
    : '';

  const messageBlock = message
    ? `<p style="margin:${headline ? '8px' : '0'} 0 0; font-size:14px; line-height:1.6; color:${bodyColor};">${escapeHtml(
        message
      )}</p>`
    : '';

  const buttonBlock = `<div style="margin:24px 0 0; text-align:center;">
      <a href="${buttonLink}" style="display:inline-block; padding:14px 36px; border-radius:999px; background:${buttonBackground}; color:${buttonTextColor}; font-size:15px; font-weight:600; letter-spacing:0.3px; text-decoration:none; border:1px solid ${buttonBorder}; box-shadow:${buttonShadow};">${buttonLabel}</a>
    </div>`;

  const backgroundStyle = normalizedBackgroundSrc
    ? ` background-image:url('${escapeHtml(normalizedBackgroundSrc)}'); background-size:cover; background-position:center; background-repeat:no-repeat;`
    : '';
  const tdStyle = `padding:36px 32px; background:${surfaceColor};${backgroundStyle}`;

  return `<tr>
  <td style="${tdStyle}">
    <div style="margin:0 auto; max-width:536px; text-align:center;">
      ${bannerBlock}
      ${headlineBlock}
      ${messageBlock}
      ${buttonBlock}
    </div>
  </td>
</tr>`;
};

const buildTemplate = async ({
  invoice = {},
  marketing = {},
  overrides = {},
  assetOptions = {},
}) => {
  const template = loadTemplate();
  const attachments = [];
  const assetCache = new Map();
  const useAbsoluteAssets = Boolean(assetOptions?.useAbsoluteUrls);
  const assetBaseUrl = sanitizeBaseUrl(assetOptions?.baseUrl) || API_PUBLIC_BASE;

  const processAsset = async (assetRef, cidBase) => {
    if (!assetRef) {
      return { src: null };
    }
    if (useAbsoluteAssets) {
      return { src: toAbsoluteUploadUrl(assetRef, assetBaseUrl) };
    }
    return ensureInlineCid(assetRef, cidBase, attachments, assetCache);
  };

  const businessName = resolveBusinessName(invoice);
  const invoiceId = resolveInvoiceId(invoice);
  const customerName = resolveCustomerName(invoice);
  const fontFamily = resolveFontFamily(invoice, marketing);
  const fontColor = resolveFontColor(invoice, marketing, overrides);
  const primaryColor = resolvePrimaryColor(invoice, marketing, overrides);
  const pageColor = resolvePageColor(invoice, marketing, overrides);
  const logoUrl = resolveLogoUrl(invoice);
  const marketingData = resolveMarketingPayload(invoice, marketing);

  const logoResult = await processAsset(logoUrl, 'tmr-logo');
  const marketingImageResult = await processAsset(marketingData.imageUrl, 'tmr-banner');
  if (marketingImageResult.src) {
    marketingData.imageSrc = marketingImageResult.src;
    if (useAbsoluteAssets) {
      marketingData.imageUrl = marketingImageResult.src;
    }
  }
  const marketingBackgroundResult = await processAsset(
    marketingData.backgroundImage,
    'tmr-banner-bg'
  );
  if (marketingBackgroundResult.src) {
    marketingData.backgroundImage = marketingBackgroundResult.src;
  }

  const total = calculateInvoiceTotal(invoice);
  const amountDue = total > 0 ? formatCurrency(total, invoice?.currency) : 'Amount pending';
  const dueDate = formatDate(invoice?.due_date || invoice?.dueDate);
  const invoiceUrl = resolveInvoiceDownloadUrl(invoice, overrides, marketingData);
  const previewUrl = resolvePreviewUrl(invoice, marketing);
  const previewSrc = useAbsoluteAssets ? toAbsoluteUploadUrl(previewUrl, assetBaseUrl) : previewUrl;

  const replacements = {
    business_name: escapeHtml(businessName),
    invoice_id: escapeHtml(invoiceId),
    customer_name: escapeHtml(customerName),
    font_family: fontFamily,
    font_color: fontColor,
    accent_color: primaryColor,
    amount_due: escapeHtml(amountDue),
    due_date: escapeHtml(dueDate),
    logo_block: buildLogoBlock(logoResult.src, businessName),
    invoice_preview_section: buildPreviewSection(previewSrc, fontColor),
    marketing_section: buildMarketingSection({
      marketing: marketingData,
      pageColor,
      fontColor,
      primaryColor,
      invoiceDownloadUrl: invoiceUrl,
    }),
    current_year: String(new Date().getFullYear()),
  };

  let html = template;
  for (const [key, value] of Object.entries(replacements)) {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    html = html.replace(pattern, value || '');
  }

  const htmlSize = Buffer.byteLength(html, 'utf8');
  if (htmlSize > MAX_HTML_SIZE_BYTES) {
    console.warn(
      `[Email] Rendered invoice email HTML is ${htmlSize} bytes, approaching Gmail's limit. Consider reducing asset sizes.`
    );
  }

  return {
    html,
    primaryColor: primaryColor || DEFAULT_PRIMARY_COLOR,
    attachments,
    assetMeta: {
      useAbsoluteAssets,
      assetBaseUrl,
    },
  };
};

const buildInvoiceEmail = async (options = {}) => {
  const invoice = options.invoice || options.summaryPayload || options.data || {};
  const marketing = options.marketing || invoice?.marketing || {};
  const overrides = {
    primaryColor: options.primaryColor || options.primary_color,
    pageColor: options.pageColor || options.page_color,
    fontColor: options.fontColor || options.font_color,
    invoiceDownloadUrl: options.invoiceDownloadUrl || options.invoice_download_url,
    invoiceUrl: options.invoiceUrl || options.invoice_url,
  };

  const assetOptions = options.assetOptions || {};

  const { html, primaryColor, attachments, assetMeta } = await buildTemplate({
    invoice,
    marketing,
    overrides,
    assetOptions,
  });
  return {
    html,
    primaryColor,
    attachments,
    assetMeta,
  };
};

const resolveUploadsBaseUrl = () => API_PUBLIC_BASE;

module.exports = {
  buildInvoiceEmail,
  loadTemplate,
  DEFAULT_PRIMARY_COLOR,
  resolveUploadsBaseUrl,
};
