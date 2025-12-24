const { getEcbRatesForDate } = require('./ecbRates');

/**
 * Convert from EUR to a target currency using ECB rates.
 * @param {Object} params
 * @param {number} params.amountEur
 * @param {string} params.targetCurrency
 * @param {Date} [params.fxDate]
 * @returns {Promise<{ convertedAmount: number, fxRate: number, rateDate: string }>}
 */
async function convertFromEur({ amountEur, targetCurrency, fxDate }) {
  const numericAmount = Number(amountEur);
  if (!Number.isFinite(numericAmount)) {
    throw new Error('amountEur must be a finite number');
  }
  const currency = typeof targetCurrency === 'string' ? targetCurrency.trim().toUpperCase() : '';
  if (!currency || currency.length !== 3) {
    throw new Error('targetCurrency must be a 3-letter code');
  }

  if (currency === 'EUR') {
    return { convertedAmount: numericAmount, fxRate: 1, rateDate: (fxDate || new Date()).toISOString().slice(0, 10) };
  }

  const rateResult = await getEcbRatesForDate(fxDate || new Date());
  if (!rateResult.ok) {
    throw new Error(`ECB rates unavailable (${rateResult.error || 'unknown error'})`);
  }
  const rate = rateResult.rates[currency];
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(`ECB rate missing for ${currency}`);
  }

  return {
    convertedAmount: numericAmount * rate,
    fxRate: rate,
    rateDate: rateResult.rateDate,
  };
}

module.exports = {
  convertFromEur,
};
