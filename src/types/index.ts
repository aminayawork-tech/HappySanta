// ─────────────────────────────────────────────────────────────
// HappySanta — Core Type Definitions
// ─────────────────────────────────────────────────────────────

// ── Auth ──────────────────────────────────────────────────────

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Recipients ────────────────────────────────────────────────

export type Relationship =
  | 'child'
  | 'parent'
  | 'sibling'
  | 'grandparent'
  | 'partner'
  | 'friend'
  | 'colleague'
  | 'other';

export type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';

export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Recipient {
  id: string;
  userId: string;          // Owner (Firebase Auth UID)
  name: string;
  age: number;
  gender?: Gender;
  relationship: Relationship;
  avatarEmoji: string;     // e.g. "🎅", "🤶", "👶"
  photoURL?: string;
  address?: Address;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Gift Lists ────────────────────────────────────────────────

export type GiftInterest =
  | 'toys'
  | 'books'
  | 'clothes'
  | 'tech'
  | 'outdoors'
  | 'games'
  | 'art'
  | 'music'
  | 'sports'
  | 'cooking'
  | 'beauty'
  | 'home'
  | 'travel'
  | 'pets'
  | 'garden'
  | 'wellness';

export type ListStatus = 'draft' | 'active' | 'complete';

export interface GiftList {
  id: string;
  userId: string;
  recipientId: string;
  recipient?: Recipient;   // Populated client-side
  year: number;            // e.g. 2025
  title: string;           // e.g. "Christmas 2025 — Emma"
  budget: number;
  interests: GiftInterest[];
  status: ListStatus;
  shareToken?: string;     // For shareable public link
  items: GiftItem[];
  totalSpent: number;      // Sum of bought items
  createdAt: Date;
  updatedAt: Date;
}

export type ItemStatus = 'suggested' | 'saved' | 'bought' | 'gifted';

export interface GiftItem {
  id: string;
  listId: string;
  // AI suggestion data
  title: string;
  aiReason: string;        // "Why it's perfect" sentence
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  // Amazon product data (populated after search)
  asin?: string;
  amazonTitle?: string;
  amazonPrice?: number;
  amazonImageUrl?: string;
  amazonUrl?: string;      // Full affiliate URL
  amazonRating?: number;
  amazonReviewCount?: number;
  amazonIsPrime?: boolean;
  // Price tracking
  priceHistory?: PricePoint[];
  allTimeLow?: number;
  allTimeLowDate?: Date;
  thirtyDayLow?: number;
  ninetyDayLow?: number;
  priceAlertEnabled: boolean;
  lastPriceCheck?: Date;
  // Status
  status: ItemStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Price Tracking ────────────────────────────────────────────

export interface PricePoint {
  date: number;   // Unix timestamp (ms)
  price: number;  // USD cents → divide by 100 for display
}

export interface PriceAlert {
  id: string;
  userId: string;
  itemId: string;
  listId: string;
  asin: string;
  targetPrice?: number;   // null = alert at all-time low
  currentPrice: number;
  allTimeLow: number;
  recipientName: string;
  itemTitle: string;
  isActive: boolean;
  triggeredAt?: Date;
  createdAt: Date;
}

// ── AI Suggestion ─────────────────────────────────────────────

export interface AISuggestion {
  id: string;               // uuid generated client-side
  title: string;
  reason: string;           // "Why it's perfect"
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  keywords: string[];       // 2–3 search phrases for Amazon
  isLoading?: boolean;      // Skeleton state while searching Amazon
  amazonProduct?: AmazonProduct;
}

// ── Amazon ────────────────────────────────────────────────────

export interface AmazonProduct {
  asin: string;
  title: string;
  price: number;            // in cents
  currency: string;
  imageUrl: string;
  url: string;              // Full affiliate URL
  rating?: number;
  reviewCount?: number;
  isPrime?: boolean;
  availability?: string;
  brand?: string;
  categories?: string[];
}

// ── Notifications ─────────────────────────────────────────────

export type NotificationType =
  | 'price_drop'
  | 'all_time_low'
  | 'list_reminder'
  | 'welcome';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: Date;
}

// ── UI & Navigation ───────────────────────────────────────────

export type RootStackParamList = {
  // Auth group
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  // Main tabs
  MainTabs: undefined;
  // Stack screens over tabs
  RecipientDetail: { recipientId: string };
  AddRecipient: { recipientId?: string };  // recipientId = edit mode
  ListDetail: { listId: string };
  CreateList: { recipientId?: string };
  AISuggestions: { listId: string };
  ProductDetail: { item: GiftItem; listId: string };
  ShareList: { listId: string; shareToken: string };
  Notifications: undefined;
  Settings: undefined;
};

export type TabParamList = {
  Home: undefined;
  Lists: undefined;
  Recipients: undefined;
  Profile: undefined;
};

// ── Settings ──────────────────────────────────────────────────

export interface AppSettings {
  theme: 'festive-dark' | 'festive-light' | 'system';
  musicEnabled: boolean;
  snowEnabled: boolean;
  pushNotificationsEnabled: boolean;
  priceAlertThreshold: 'any' | 'all_time_low' | 'five_percent' | 'ten_percent';
  currencySymbol: string;
  fcmToken?: string;
}
