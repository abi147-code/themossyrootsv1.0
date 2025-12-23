const { getEcbRatesForDate } = require('./ecbRates');

const FX_SOURCE = 'ECB';

const isFlagEnabled = () => {
  console.warn('[FX DEBUG] attemptNormalization entered', {
    flag: process.env.FX_NORMALIZATION_WRITE_ENABLED,
  });
  const raw = process.env.FX_NORMALIZATION_WRITE_ENABLED;
  if (!raw) return false;
  const trimmed = raw.toString().trim().toLowerCase();
  return trimmed === 'true' || trimmed === '1' || trimmed === 'yes' || trimmed === 'on';
};

const toUpperSafe = (value) =>
  typeof value === 'string' && value.trim() ? value.trim().toUpperCase() : null;

const isValidCurrencyCode = (code) => typeof code === 'string' && /^[A-Z]{3}$/.test(code);

/**
 * Attempt to normalize an amount to EUR using ECB rates.
 * Returns a structured result; never throws. Does nothing if the flag is off.
 *
 * @param {object} params
 * @param {string} params.currency - Original currency code
 * @param {number} params.amount - Original amount (number)
 * @param {Date} params.atDate - UTC date to use for FX lookup
 * @returns {Promise<{status: 'flag_disabled'|'invalid_currency'|'rate_unavailable'|'success', writeData?: object, log: object}>}
 */
async function attemptNormalization({ currency, amount, atDate }) {
  if (!isFlagEnabled()) {
    return {
      status: 'flag_disabled',
      log: { reason: 'FLAG_DISABLED' },
    };
  }

  const currencyCode = toUpperSafe(currency);
  if (!currencyCode || !isValidCurrencyCode(currencyCode)) {
    return {
      status: 'invalid_currency',
      writeData: { isNormalized: false, normalizationStatus: 'FAILED_INVALID_CURRENCY' },
      log: { reason: 'INVALID_CURRENCY', currency },
    };
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) {
    return {
      status: 'invalid_currency',
      writeData: { isNormalized: false, normalizationStatus: 'FAILED_INVALID_CURRENCY' },
      log: { reason: 'INVALID_AMOUNT', amount },
    };
  }

  const rateDate = atDate instanceof Date ? atDate : new Date();

  if (currencyCode === 'EUR') {
    return {
      status: 'success',
      writeData: {
        originalAmount: numericAmount,
        originalCurrency: currencyCode,
        originalTotal: numericAmount,
        normalizedAmountEur: numericAmount,
        fxRate: 1.0,
        fxRateDate: rateDate,
        fxRateSource: FX_SOURCE,
        isNormalized: true,
        normalizationStatus: 'NORMALIZED',
      },
      log: {
        currency: currencyCode,
        amount: numericAmount,
        normalizedAmountEur: numericAmount,
        fxRate: 1.0,
        fxRateDate: rateDate,
        reason: 'SUCCESS',
      },
    };
  }

  const rateResult = await getEcbRatesForDate(rateDate);
  if (!rateResult.ok) {
    return {
      status: 'rate_unavailable',
      writeData: { isNormalized: false, normalizationStatus: 'SKIPPED_RATE_UNAVAILABLE' },
      log: { reason: 'RATE_UNAVAILABLE', error: rateResult.error, currency: currencyCode },
    };
  }

  const rate = rateResult.rates[currencyCode];
  if (!Number.isFinite(rate) || rate <= 0) {
    return {
      status: 'invalid_currency',
      writeData: { isNormalized: false, normalizationStatus: 'FAILED_INVALID_CURRENCY' },
      log: { reason: 'INVALID_CURRENCY', currency: currencyCode },
    };
  }

  const normalizedAmountEur = numericAmount / rate;

  return {
    status: 'success',
    writeData: {
      originalAmount: numericAmount,
      originalCurrency: currencyCode,
      originalTotal: numericAmount,
      normalizedAmountEur,
      fxRate: rate,
      fxRateDate: rateResult.rateDate ? new Date(`${rateResult.rateDate}T00:00:00Z`) : rateDate,
      fxRateSource: FX_SOURCE,
      isNormalized: true,
      normalizationStatus: 'NORMALIZED',
    },
    log: {
      currency: currencyCode,
      amount: numericAmount,
      normalizedAmountEur,
      fxRate: rate,
      fxRateDate: rateResult.rateDate || rateDate,
      reason: 'SUCCESS',
    },
  };
}

module.exports = {
  attemptNormalization,
};
