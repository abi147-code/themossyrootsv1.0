const { getEcbRatesForDate } = require('./ecbRates');

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'INR', 'GBP'];

/**
 * Build a flat multi-currency billed snapshot from a normalized EUR amount.
 * Runs once at send time; never re-run on read.
 *
 * @param {Object} params
 * @param {number} params.amountEur - Normalized amount in EUR
 * @param {Date} [params.fxDate] - Date to fetch ECB rates for
 * @returns {Promise<Record<string, number>>} // { EUR, USD, INR, GBP }
 */
async function buildBilledSnapshot({ amountEur, fxDate }) {
  const numericAmount = Number(amountEur);
  if (!Number.isFinite(numericAmount)) {
    throw new Error('amountEur must be a finite number');
  }

  const rateResult = await getEcbRatesForDate(fxDate || new Date());
  if (!rateResult.ok) {
    throw new Error(`ECB rates unavailable (${rateResult.error || 'unknown error'})`);
  }

  const snapshot = {};
  for (const currency of SUPPORTED_CURRENCIES) {
    if (currency === 'EUR') {
      snapshot[currency] = numericAmount;
      continue;
    }
    const rate = rateResult.rates[currency];
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error(`ECB rate missing for ${currency}`);
    }
    snapshot[currency] = numericAmount * rate;
  }

  return snapshot;
}

module.exports = {
  buildBilledSnapshot,
  SUPPORTED_CURRENCIES,
};
