// ─────────────────────────────────────────────────────────────
// HappySanta — Amazon Creators API Service
// Uses the Amazon Creators API (2026) to search products and
// build affiliate links. All product links embed your tag so
// you earn commissions on every purchase.
//
// Docs: https://affiliate-program.amazon.com/creatorsapi/docs/
// ─────────────────────────────────────────────────────────────
import axios, { type AxiosInstance } from 'axios';
import { buildAmazonUrl } from '@/utils/constants';
import type { AmazonProduct } from '@/types';

// ── Client setup ──────────────────────────────────────────────

const CREATORS_API_KEY =
  process.env.EXPO_PUBLIC_AMAZON_CREATORS_API_KEY ?? '';
const AFFILIATE_TAG =
  process.env.EXPO_PUBLIC_AMAZON_AFFILIATE_TAG ?? 'happysanta-20';
const BASE_URL =
  process.env.EXPO_PUBLIC_AMAZON_API_BASE_URL ?? 'https://api.creators.amazon.com/v1';
const MARKETPLACE = process.env.EXPO_PUBLIC_AMAZON_MARKETPLACE_ID ?? '1'; // 1 = US

let client: AxiosInstance | null = null;

function getClient(): AxiosInstance {
  if (client) return client;
  client = axios.create({
    baseURL: BASE_URL,
    headers: {
      'x-api-key':     CREATORS_API_KEY,
      'Content-Type':  'application/json',
      Accept:          'application/json',
    },
    timeout: 15000,
  });
  return client;
}

// ── Response types (Creators API 2026 schema) ─────────────────

interface CreatorsSearchItem {
  asin:   string;
  title:  string;
  price?: {
    amount:   number;  // cents
    currency: string;
  };
  images?: {
    primary?: { large?: { url: string } };
  };
  customerReviews?: {
    count: number;
    starRating?: { value: number };
  };
  offers?: Array<{
    deliveryInfo?: { isPrimeEligible?: boolean };
    availability?: { type?: string };
  }>;
  brand?: string;
  browseNodeInfo?: {
    browseNodes?: Array<{ displayName?: string }>;
  };
}

interface CreatorsSearchResponse {
  searchResult?: {
    items?: CreatorsSearchItem[];
    totalResultCount?: number;
  };
}

// ── Map to internal type ──────────────────────────────────────

function mapItem(raw: CreatorsSearchItem): AmazonProduct {
  const priceAmount = raw.price?.amount ?? 0;
  const imageUrl =
    raw.images?.primary?.large?.url ??
    'https://via.placeholder.com/300x300?text=No+Image';
  const rating = raw.customerReviews?.starRating?.value;
  const reviewCount = raw.customerReviews?.count;
  const isPrime = raw.offers?.[0]?.deliveryInfo?.isPrimeEligible ?? false;
  const categories = raw.browseNodeInfo?.browseNodes
    ?.map((n) => n.displayName ?? '')
    .filter(Boolean);

  return {
    asin:        raw.asin,
    title:       raw.title,
    price:       priceAmount,        // in cents
    currency:    raw.price?.currency ?? 'USD',
    imageUrl,
    url:         buildAmazonUrl(raw.asin, AFFILIATE_TAG),
    rating,
    reviewCount,
    isPrime,
    brand:       raw.brand,
    categories,
    availability: raw.offers?.[0]?.availability?.type,
  };
}

// ── Search Items ──────────────────────────────────────────────

export interface SearchItemsParams {
  keywords: string;
  maxResults?: number;
  minPrice?: number;  // cents
  maxPrice?: number;  // cents
  sortBy?: 'Relevance' | 'Price:LowToHigh' | 'Price:HighToLow' | 'ReviewRank';
}

/**
 * Search Amazon for products matching the given keywords.
 * Returns up to maxResults (default 3) AmazonProduct objects.
 */
export async function searchAmazonProducts(
  params: SearchItemsParams,
): Promise<AmazonProduct[]> {
  const { keywords, maxResults = 3, minPrice, maxPrice, sortBy = 'Relevance' } = params;

  // Build request body per Creators API spec
  const body: Record<string, unknown> = {
    keywords,
    marketplace:  MARKETPLACE,
    partnerTag:   AFFILIATE_TAG,
    partnerType:  'Associates',
    searchIndex:  'All',
    itemCount:    Math.min(maxResults, 10),
    resources: [
      'Images.Primary.Large',
      'ItemInfo.Title',
      'Offers.Listings.Price',
      'Offers.Listings.DeliveryInfo.IsPrimeEligible',
      'Offers.Listings.Availability.Type',
      'CustomerReviews.Count',
      'CustomerReviews.StarRating',
      'ItemInfo.ByLineInfo',
      'BrowseNodeInfo.BrowseNodes',
    ],
    sortBy,
  };

  if (minPrice !== undefined) body.minPrice = minPrice;
  if (maxPrice !== undefined) body.maxPrice = maxPrice;

  try {
    const response = await getClient().post<CreatorsSearchResponse>(
      '/products/search',
      body,
    );
    const items = response.data.searchResult?.items ?? [];
    return items.map(mapItem);
  } catch (err) {
    // Graceful degradation — return empty array rather than crashing
    console.error('[AmazonCreatorsAPI] searchItems error:', err);
    return [];
  }
}

/**
 * Fetch a single product by ASIN.
 * Used when we already know the ASIN (e.g. from price tracking).
 */
export async function getProductByAsin(asin: string): Promise<AmazonProduct | null> {
  try {
    const response = await getClient().post<{ itemsResult?: { items?: CreatorsSearchItem[] } }>(
      '/products/items',
      {
        itemIds:     [asin],
        itemIdType:  'ASIN',
        partnerTag:  AFFILIATE_TAG,
        partnerType: 'Associates',
        marketplace: MARKETPLACE,
        resources: [
          'Images.Primary.Large',
          'ItemInfo.Title',
          'Offers.Listings.Price',
          'Offers.Listings.DeliveryInfo.IsPrimeEligible',
          'CustomerReviews.Count',
          'CustomerReviews.StarRating',
          'ItemInfo.ByLineInfo',
        ],
      },
    );
    const items = response.data.itemsResult?.items ?? [];
    return items.length > 0 ? mapItem(items[0]) : null;
  } catch (err) {
    console.error('[AmazonCreatorsAPI] getItemByAsin error:', err);
    return null;
  }
}

/**
 * Search for each set of keywords and return the best match.
 * Called after AI suggestions to hydrate each card with a real product.
 */
export async function findBestProductForKeywords(
  keywordsList: string[],
  budget: number,          // dollars
): Promise<AmazonProduct | null> {
  const maxPrice = Math.round(budget * 100); // convert to cents

  for (const keywords of keywordsList) {
    const results = await searchAmazonProducts({
      keywords,
      maxResults: 3,
      maxPrice,
      sortBy: 'Relevance',
    });
    if (results.length > 0) return results[0];
  }
  return null;
}
