// ─────────────────────────────────────────────────────────────
// HappySanta — General Helper Utilities
// ─────────────────────────────────────────────────────────────
import { format, formatDistanceToNow } from 'date-fns';

// ── Currency ──────────────────────────────────────────────────

/**
 * Format a dollar amount for display.
 * @param cents  Amount in cents (Keepa uses cents × 100)
 * @param fromCents  If true, divide by 100 first
 */
export function formatPrice(value: number, fromCents = false): string {
  const dollars = fromCents ? value / 100 : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/** Format a price range like "$25 – $50" */
export function formatPriceRange(min: number, max: number): string {
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}

/** Percentage discount between two prices */
export function discountPercent(original: number, current: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - current) / original) * 100);
}

// ── Dates ──────────────────────────────────────────────────────

export function formatDate(date: Date | number): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatRelativeDate(date: Date | number): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isChristmasSeason(): boolean {
  const month = new Date().getMonth() + 1; // 1–12
  return month === 11 || month === 12 || month === 1;
}

export function daysUntilChristmas(): number {
  const today = new Date();
  const christmasThisYear = new Date(today.getFullYear(), 11, 25); // Dec 25
  const christmasNextYear = new Date(today.getFullYear() + 1, 11, 25);
  const target = today > christmasThisYear ? christmasNextYear : christmasThisYear;
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Strings ───────────────────────────────────────────────────

/** Truncate a string to maxLen characters with an ellipsis */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return `${str.slice(0, maxLen - 1)}…`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Generate a random alphanumeric token for share links */
export function generateShareToken(len = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/** Very simple UUID v4 (no external lib needed for IDs) */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Lists ──────────────────────────────────────────────────────

export function calcListProgress(totalBudget: number, totalSpent: number): number {
  if (totalBudget <= 0) return 0;
  return Math.min(1, totalSpent / totalBudget);
}

export function budgetRemaining(budget: number, spent: number): number {
  return Math.max(0, budget - spent);
}

// ── Price History ─────────────────────────────────────────────

/**
 * Convert Keepa's compact price history array into [{ date, price }] pairs.
 * Keepa returns pairs like [unixDays, centsPrice, unixDays, centsPrice, ...]
 * where price -1 = out-of-stock, price is in USD cents.
 */
export function parseKeepaHistory(
  raw: number[],
): { date: number; price: number }[] {
  const result: { date: number; price: number }[] = [];
  for (let i = 0; i + 1 < raw.length; i += 2) {
    const keepaDays = raw[i];
    const priceCents = raw[i + 1];
    if (priceCents < 0) continue; // skip out-of-stock
    // Keepa days → Unix ms (Keepa epoch = 2011-01-01)
    const KEEPA_EPOCH_MS = new Date('2011-01-01').getTime();
    const dateMs = KEEPA_EPOCH_MS + keepaDays * 24 * 60 * 60 * 1000;
    result.push({ date: dateMs, price: priceCents / 100 });
  }
  return result;
}

// ── Validation ────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidZip(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip);
}
