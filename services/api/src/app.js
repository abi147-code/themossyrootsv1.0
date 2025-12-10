const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('./middleware/auth');
const { uploadsRoot } = require('./utils/avatar');
const {
  tempAssetRoot,
  ensureTempAssetDir,
  scheduleTempAssetCleanup,
} = require('./utils/tempAssets');
const ensureAdminUser = require('./utils/ensureAdminUser');

dotenv.config();

const prisma = new PrismaClient();
const app = express();

ensureAdminUser(prisma)
  .then((message) => {
    if (message) {
      console.log(message);
    }
  })
  .catch((error) => {
    console.error('[bootstrap] Failed to ensure admin user', error);
  });

app.set('trust proxy', 1);

const DEFAULT_ALLOWED_ORIGINS = [
  'https://tmr-web.onrender.com',
  'https://www.themossyroots.com',
  'http://localhost',
  'http://localhost:3000',
  'http://localhost:5173',
];

const parseCorsOrigins = (value) => {
  if (!value || typeof value !== 'string') {
    return [];
  }
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const envOriginList = parseCorsOrigins(process.env.CORS_ORIGIN);
const resolvedCorsOrigin = envOriginList.includes('*')
  ? '*'
  : Array.from(new Set([...envOriginList, ...DEFAULT_ALLOWED_ORIGINS]));

app.use(
  cors({
    origin: resolvedCorsOrigin,
    credentials: true,
  })
);
app.options('*', cors());
console.log(`[cors] Using CORS origin: ${resolvedCorsOrigin}`);

ensureTempAssetDir();
scheduleTempAssetCleanup();
app.use('/uploads', express.static(uploadsRoot));
app.use('/temp-assets', express.static(tempAssetRoot));

// Stripe webhook must remain raw before JSON parsing
app.use('/api/billing/stripe/webhook', express.raw({ type: 'application/json' }));

const BODY_LIMIT = '10mb';
const jsonParser = express.json({ limit: BODY_LIMIT });
const urlencodedParser = express.urlencoded({ extended: true, limit: BODY_LIMIT });

app.use((req, res, next) => {
  if (req.originalUrl === '/api/billing/stripe/webhook') {
    return next();
  }
  return jsonParser(req, res, next);
});

app.use((req, res, next) => {
  if (req.originalUrl === '/api/billing/stripe/webhook') {
    return next();
  }
  return urlencodedParser(req, res, next);
});

app.use((req, _res, next) => {
  req.prisma = prisma;
  next();
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'TMR API' }));

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const invoiceRoutes = require('./routes/invoice');
const emailRoutes = require('./routes/email');
const socialRoutes = require('./routes/social');
const billingRoutes = require('./routes/billing');
const historyRoutes = require('./routes/history');
const campaignRoutes = require('./routes/campaignRoutes');
const accountRoutes = require('./routes/account');
const brandRoutes = require('./routes/brand');
const adminRoutes = require('./routes/admin');
const viteInvoiceRoutes = require('./routes/viteInvoice');
const tempAssetUploadRoutes = require('./routes/tempAssetUpload');

app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/invoice', authMiddleware, invoiceRoutes);
app.use('/api/email', authMiddleware, emailRoutes);
app.use('/api/social', authMiddleware, socialRoutes);
app.use('/api/history', authMiddleware, historyRoutes);
app.use('/api/campaigns', authMiddleware, campaignRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/vite-invoice', tempAssetUploadRoutes);
app.use('/api/vite-invoice', viteInvoiceRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not Found' }));

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = Number(process.env.API_PORT || process.env.PORT || 4000);
app.listen(PORT, () => console.log(`✅ TMR API running on port ${PORT}`));

module.exports = app;
