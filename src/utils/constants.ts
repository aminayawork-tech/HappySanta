// ─────────────────────────────────────────────────────────────
// HappySanta — App-wide Constants
// ─────────────────────────────────────────────────────────────
import type { GiftInterest, Relationship } from '@/types';

// ── Brand / Theme ─────────────────────────────────────────────

export const COLORS = {
  // Primary palette
  santaRed:   '#C41E3A',
  forestGreen:'#165B33',
  gold:       '#FFD700',
  silver:     '#C0C0C0',
  snow:       '#FFFAFA',

  // Background shades (dark festive theme)
  bgDark:     '#1a0a2e',
  bgCard:     '#2a1a3e',
  bgInput:    '#3a2a4e',
  bgMidnight: '#0d0620',

  // Text
  textPrimary:   '#FFFAFA',
  textSecondary: '#C0C0C0',
  textMuted:     '#8a7a9e',
  textGold:      '#FFD700',

  // Status
  success:  '#4CAF50',
  warning:  '#FF9800',
  error:    '#f44336',
  info:     '#2196F3',

  // Gradients (start → end)
  gradientHeader: ['#C41E3A', '#8B0000'],
  gradientCard:   ['#2a1a3e', '#1a0a2e'],
  gradientGold:   ['#FFD700', '#FFA500'],
  gradientGreen:  ['#165B33', '#0d3d21'],
  gradientSanta:  ['#C41E3A', '#165B33'],
} as const;

export const FONTS = {
  christmas:     'LobsterTwo_400Regular',
  christmasBold: 'LobsterTwo_700Bold',
  body:          'Nunito_400Regular',
  bodySemiBold:  'Nunito_600SemiBold',
  bodyBold:      'Nunito_700Bold',
  bodyExtraBold: 'Nunito_800ExtraBold',
} as const;

// ── Relationships ─────────────────────────────────────────────

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  child:       'Child',
  parent:      'Parent',
  sibling:     'Sibling',
  grandparent: 'Grandparent',
  partner:     'Partner / Spouse',
  friend:      'Friend',
  colleague:   'Colleague',
  other:       'Other',
};

export const RELATIONSHIP_EMOJIS: Record<Relationship, string> = {
  child:       '👶',
  parent:      '👨‍👩‍👦',
  sibling:     '👫',
  grandparent: '👴',
  partner:     '💑',
  friend:      '🤝',
  colleague:   '💼',
  other:       '🎁',
};

// ── Recipient Avatars ─────────────────────────────────────────

export const AVATAR_EMOJIS = [
  '🎅', '🤶', '👼', '🦌', '⛄', '🎄', '🌟', '❄️',
  '🎁', '🔔', '🕯️', '🦉', '🐻', '🦊', '🐧', '🐼',
  '👨', '👩', '👦', '👧', '🧓', '👴', '👵', '🧑',
];

// ── Gift Interests ─────────────────────────────────────────────

export const INTEREST_LABELS: Record<GiftInterest, string> = {
  toys:     'Toys & Games',
  books:    'Books',
  clothes:  'Clothes & Fashion',
  tech:     'Tech & Gadgets',
  outdoors: 'Outdoors & Sports',
  games:    'Video Games',
  art:      'Art & Crafts',
  music:    'Music',
  sports:   'Sports',
  cooking:  'Cooking & Baking',
  beauty:   'Beauty & Self-care',
  home:     'Home & Garden',
  travel:   'Travel',
  pets:     'Pets',
  garden:   'Gardening',
  wellness: 'Health & Wellness',
};

export const INTEREST_EMOJIS: Record<GiftInterest, string> = {
  toys:     '🧸',
  books:    '📚',
  clothes:  '👗',
  tech:     '💻',
  outdoors: '🏕️',
  games:    '🎮',
  art:      '🎨',
  music:    '🎵',
  sports:   '⚽',
  cooking:  '🍳',
  beauty:   '💄',
  home:     '🏠',
  travel:   '✈️',
  pets:     '🐾',
  garden:   '🌱',
  wellness: '🧘',
};

// ── Budget Presets ─────────────────────────────────────────────

export const BUDGET_PRESETS = [25, 50, 75, 100, 150, 200, 300, 500];
export const BUDGET_MIN = 10;
export const BUDGET_MAX = 1000;

// ── Amazon ────────────────────────────────────────────────────

export const AMAZON_BASE_URL = 'https://www.amazon.com/dp/';
export const AMAZON_AFFILIATE_TAG = process.env.EXPO_PUBLIC_AMAZON_AFFILIATE_TAG ?? 'happysanta-20';

/** Build a full affiliate product URL from ASIN */
export function buildAmazonUrl(asin: string, affiliateTag = AMAZON_AFFILIATE_TAG): string {
  return `${AMAZON_BASE_URL}${asin}?tag=${affiliateTag}`;
}

// ── App ───────────────────────────────────────────────────────

export const CURRENT_YEAR = new Date().getFullYear();
export const APP_NAME = 'HappySanta';
export const APP_TAGLINE = 'AI Santa builds the perfect list.\nWe watch the prices so you don\'t have to.';

// ── Firestore Collection Names ────────────────────────────────

export const COLLECTIONS = {
  users:       'users',
  recipients:  'recipients',
  lists:       'lists',
  items:       'items',
  priceAlerts: 'priceAlerts',
  notifications:'notifications',
} as const;

// ── Notification Channels ─────────────────────────────────────

export const NOTIFICATION_CHANNELS = {
  priceDrop:    'price-drop',
  priceAlert:   'price-alert',
  listReminder: 'list-reminder',
} as const;
