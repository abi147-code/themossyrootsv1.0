const axios = require('axios');

// In-memory cache keyed by UTC date string (YYYY-MM-DD)
const rateCache = new Map();

const ECB_HIST_URL = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml';
const HTTP_TIMEOUT_MS = 2000;
const MAX_RETRIES = 1;

const formatUtcDate = (date) => {
  const d = new Date(date instanceof Date ? date.getTime() : Date.now());
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

const parseEcbXml = (xmlText) => {
  const results = new Map();
  const timeBlockRegex = /<Cube\s+time=['"](\d{4}-\d{2}-\d{2})['"]>([\s\S]*?)<\/Cube>/g;
  const rateRegex = /<Cube\s+currency=['"]([A-Z]{3})['"]\s+rate=['"]([0-9.]+)['"]\s*\/>/g;

  let timeMatch;
  while ((timeMatch = timeBlockRegex.exec(xmlText)) !== null) {
    const [, dateStr, block] = timeMatch;
    const dailyRates = {};
    let rateMatch;
    while ((rateMatch = rateRegex.exec(block)) !== null) {
      const [, currency, rate] = rateMatch;
      const numericRate = Number(rate);
      if (Number.isFinite(numericRate)) {
        dailyRates[currency] = numericRate;
      }
    }
    if (Object.keys(dailyRates).length > 0) {
      results.set(dateStr, dailyRates);
    }
  }

  return results;
};

const fetchEcbFeedWithRetry = async () => {
  let attempt = 0;
  let lastError = null;
  while (attempt <= MAX_RETRIES) {
    try {
      const response = await axios.get(ECB_HIST_URL, { timeout: HTTP_TIMEOUT_MS });
      return { ok: true, xml: response.data };
    } catch (err) {
      lastError = err;
      attempt += 1;
      if (attempt <= MAX_RETRIES) {
        console.warn(`[ECB] Fetch failed (attempt ${attempt}) — retrying`, err.message || err.toString());
      }
    }
  }
  return { ok: false, error: lastError };
};

const findClosestDate = (targetDateStr, availableDates) => {
  const sorted = [...availableDates].sort().reverse();
  for (const dateStr of sorted) {
    if (dateStr <= targetDateStr) {
      return dateStr;
    }
  }
  return null;
};

/**
 * Fetch ECB daily FX rates for a given UTC date (with fallback to prior business day).
 * @param {Date} utcDate
 * @returns {Promise<{ok: true, rateDate: string, rates: Record<string, number>} | {ok: false, error: string}>}
 */
async function getEcbRatesForDate(utcDate) {
  const requestedDateStr = formatUtcDate(utcDate || new Date());

  const cached = rateCache.get(requestedDateStr);
  if (cached) {
    console.info(
      `[ECB] Cache hit for ${requestedDateStr} (using ${cached.rateDate}); currencies=${Object.keys(
        cached.rates || {},
      ).length}`,
    );
    return { ok: true, rateDate: cached.rateDate, rates: cached.rates };
  }

  const fetchResult = await fetchEcbFeedWithRetry();
  if (!fetchResult.ok) {
    console.warn('[ECB] Failed to fetch rates after retries', fetchResult.error?.message || fetchResult.error);
    return { ok: false, error: 'FETCH_FAILED' };
  }

  const dateMap = parseEcbXml(fetchResult.xml);
  if (dateMap.size === 0) {
    console.warn('[ECB] No rates parsed from ECB feed');
    return { ok: false, error: 'PARSE_FAILED' };
  }

  // Populate cache for all parsed dates to avoid re-fetching.
  dateMap.forEach((rates, dateStr) => {
    rateCache.set(dateStr, { rateDate: dateStr, rates });
  });

  const closestDate = findClosestDate(requestedDateStr, dateMap.keys());
  if (!closestDate) {
    console.warn(`[ECB] No rates available for ${requestedDateStr} or earlier`);
    return { ok: false, error: 'NO_DATA_FOR_DATE' };
  }

  const rates = dateMap.get(closestDate);
  if (!rates || Object.keys(rates).length === 0) {
    console.warn(`[ECB] Rates missing for resolved date ${closestDate}`);
    return { ok: false, error: 'NO_RATES_FOR_DATE' };
  }

  if (closestDate !== requestedDateStr) {
    console.warn(`[ECB] Falling back from ${requestedDateStr} to prior business day ${closestDate}`);
  }

  console.info(
    `[ECB] Rates loaded for ${closestDate} (requested ${requestedDateStr}); currencies=${Object.keys(rates).length}`,
  );

  return { ok: true, rateDate: closestDate, rates };
}

module.exports = {
  getEcbRatesForDate,
};
