// ─────────────────────────────────────────────────────────────
// HappySanta — Keepa Price History API Service
// Keepa is the industry standard for Amazon price tracking.
// Sign up: https://keepa.com/#!api
// Docs:    https://keepa.com/mm5/graphics/user_manual_api.pdf
// ─────────────────────────────────────────────────────────────
import axios from 'axios';
import { parseKeepaHistory } from '@/utils/helpers';
import type { PricePoint } from '@/types';

const KEEPA_API_KEY =
  process.env.EXPO_PUBLIC_KEEPA_API_KEY ?? '';
const KEEPA_BASE_URL =
  process.env.EXPO_PUBLIC_KEEPA_API_BASE_URL ?? 'https://api.keepa.com';

// ── Keepa domain codes ────────────────────────────────────────
// 1=US, 3=UK, 4=DE, 5=FR, 6=JP, 7=CA, 8=ES, 9=IT, 10=IN, 11=MX, 12=BR

const DOMAIN = 1; // US

// ── Response type (subset of Keepa product schema) ────────────

interface KeepaProduct {
  asin:   string;
  title?: string;
  // csv: price history arrays. Index 0 = Amazon, 1 = Marketplace New, ...
  // Each is [keepaDays, price, keepaDays, price, ...]
  csv?: (number[] | null)[];
  stats?: {
    min:          number[];   // per csv type: all-time min price
    max:          number[];   // per csv type: all-time max price
    avg:          number[];   // per csv type: avg
    avg30:        number[];
    avg90:        number[];
    current:      number[];
    outOfStockPercentageInInterval?: number[];
  };
  lowestNewFBA?: number;
}

interface KeepaResponse {
  products?: KeepaProduct[];
  tokensLeft?: number;
  timestamp?: number;
}

// ── Price history result ──────────────────────────────────────

export interface KeepaProductPrice {
  asin:           string;
  currentPrice:   number;       // in USD (not cents)
  allTimeLow:     number;
  allTimeLowDate?: Date;
  thirtyDayLow:   number;
  ninetyDayLow:   number;
  priceHistory:   PricePoint[]; // {date: unixMs, price: USD}
  tokensLeft?:    number;
}

// ── Keepa CSV index constants ─────────────────────────────────
const CSV_NEW_FBA = 0;   // Amazon / New FBA — most relevant for gift shopping
const CSV_NEW_MKT = 1;   // Marketplace New 3rd party

// ── Main export ───────────────────────────────────────────────

/**
 * Fetch price history for one ASIN.
 * Costs ~5 Keepa tokens per call.
 * Keepa plan: https://keepa.com/#!api (Startup = 7,200 tokens/day)
 */
export async function fetchPriceHistory(asin: string): Promise<KeepaProductPrice | null> {
  try {
    const response = await axios.get<KeepaResponse>(`${KEEPA_BASE_URL}/product`, {
      params: {
        key:    KEEPA_API_KEY,
        domain: DOMAIN,
        asin,
        history: 1,
        stats:   90,  // Ask Keepa for 90-day stats
      },
      timeout: 20000,
    });

    const product = response.data.products?.[0];
    if (!product) return null;

    const stats = product.stats;
    const csv   = product.csv;

    // Extract Amazon / New FBA price array (index 0)
    const priceArray = csv?.[CSV_NEW_FBA] ?? csv?.[CSV_NEW_MKT] ?? [];

    // Parse raw array into [{date, price}] pairs
    const priceHistory = parseKeepaHistory(priceArray);

    // All prices from Keepa are in cents. Convert to USD.
    const currentCents = stats?.current?.[CSV_NEW_FBA]
      ?? stats?.current?.[CSV_NEW_MKT]
      ?? -1;
    const minCents     = stats?.min?.[CSV_NEW_FBA]
      ?? stats?.min?.[CSV_NEW_MKT]
      ?? -1;
    const avg30Cents   = stats?.avg30?.[CSV_NEW_FBA] ?? -1;
    const avg90Cents   = stats?.avg90?.[CSV_NEW_FBA] ?? -1;

    // Keepa uses -1 for "unavailable"
    const toUSD = (cents: number) => cents > 0 ? cents / 100 : 0;

    // Find the all-time-low date from price history
    let allTimeLowDate: Date | undefined;
    if (minCents > 0 && priceHistory.length > 0) {
      const atl = priceHistory.find((p) => Math.round(p.price * 100) === minCents);
      if (atl) allTimeLowDate = new Date(atl.date);
    }

    return {
      asin,
      currentPrice:  toUSD(currentCents),
      allTimeLow:    toUSD(minCents),
      allTimeLowDate,
      thirtyDayLow:  toUSD(avg30Cents),  // Using avg30 as 30-day reference
      ninetyDayLow:  toUSD(avg90Cents),  // Using avg90 as 90-day reference
      priceHistory,
      tokensLeft:    response.data.tokensLeft,
    };
  } catch (err) {
    console.error('[Keepa] fetchPriceHistory error:', err);
    return null;
  }
}

/**
 * Batch fetch price history for multiple ASINs.
 * Keepa supports up to 100 ASINs per request (more token-efficient).
 */
export async function fetchPriceHistoryBatch(
  asins: string[],
): Promise<KeepaProductPrice[]> {
  if (asins.length === 0) return [];

  // Keepa batch: comma-separated ASINs
  const asinParam = asins.slice(0, 100).join(',');

  try {
    const response = await axios.get<KeepaResponse>(`${KEEPA_BASE_URL}/product`, {
      params: {
        key:     KEEPA_API_KEY,
        domain:  DOMAIN,
        asin:    asinParam,
        history: 1,
        stats:   90,
      },
      timeout: 30000,
    });

    const products = response.data.products ?? [];
    return products.map((product) => {
      const stats = product.stats;
      const csv   = product.csv;
      const priceArray = csv?.[CSV_NEW_FBA] ?? csv?.[CSV_NEW_MKT] ?? [];
      const priceHistory = parseKeepaHistory(priceArray);

      const toUSD = (cents: number) => cents > 0 ? cents / 100 : 0;
      const currentCents = stats?.current?.[CSV_NEW_FBA] ?? -1;
      const minCents     = stats?.min?.[CSV_NEW_FBA] ?? -1;
      const avg30Cents   = stats?.avg30?.[CSV_NEW_FBA] ?? -1;
      const avg90Cents   = stats?.avg90?.[CSV_NEW_FBA] ?? -1;

      let allTimeLowDate: Date | undefined;
      if (minCents > 0 && priceHistory.length > 0) {
        const atl = priceHistory.find((p) => Math.round(p.price * 100) === minCents);
        if (atl) allTimeLowDate = new Date(atl.date);
      }

      return {
        asin:          product.asin,
        currentPrice:  toUSD(currentCents),
        allTimeLow:    toUSD(minCents),
        allTimeLowDate,
        thirtyDayLow:  toUSD(avg30Cents),
        ninetyDayLow:  toUSD(avg90Cents),
        priceHistory,
        tokensLeft:    response.data.tokensLeft,
      };
    });
  } catch (err) {
    console.error('[Keepa] fetchPriceHistoryBatch error:', err);
    return [];
  }
}

/**
 * Determine if current price is at or near all-time low.
 * Returns true if within 5% of all-time low.
 */
export function isAtAllTimeLow(currentPrice: number, allTimeLow: number): boolean {
  if (allTimeLow <= 0 || currentPrice <= 0) return false;
  const threshold = allTimeLow * 1.05; // 5% buffer
  return currentPrice <= threshold;
}
