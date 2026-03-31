// ─────────────────────────────────────────────────────────────
// HappySanta — Gift Lists Store (Zustand)
// Manages lists + items, AI suggestions, and price tracking.
// ─────────────────────────────────────────────────────────────
import { create } from 'zustand';
import {
  saveList,
  getLists,
  deleteList,
  subscribeToLists,
  saveGiftItem,
  getGiftItems,
  subscribeToGiftItems,
  updateGiftItemStatus,
  updateGiftItemPrice,
  deleteGiftItem,
} from '@/services/firebase/firestore';
import { getAISuggestions, type GetSuggestionsParams } from '@/services/ai/openai';
import { findBestProductForKeywords } from '@/services/amazon/creatorsApi';
import { fetchPriceHistory, isAtAllTimeLow } from '@/services/keepa/keepaApi';
import { schedulePriceDropNotification } from '@/services/firebase/notifications';
import { uuid } from '@/utils/helpers';
import type { GiftList, GiftItem, AISuggestion } from '@/types';

interface ListsState {
  lists:           GiftList[];
  activeListItems: GiftItem[];          // Items for the currently viewed list
  aiSuggestions:  AISuggestion[];
  isLoading:       boolean;
  isSuggestingAI:  boolean;
  error:           string | null;

  // List CRUD
  subscribe:        (userId: string) => () => void;
  fetchLists:       (userId: string) => Promise<void>;
  createList:       (userId: string, data: Omit<GiftList, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'items' | 'totalSpent'>) => Promise<GiftList>;
  removeList:       (listId: string) => Promise<void>;
  getListById:      (id: string) => GiftList | undefined;

  // Items
  subscribeToItems: (listId: string) => () => void;
  fetchItems:       (listId: string) => Promise<void>;
  addItemToList:    (listId: string, item: Omit<GiftItem, 'id' | 'listId' | 'createdAt' | 'updatedAt'>) => Promise<GiftItem>;
  updateItemStatus: (listId: string, itemId: string, status: GiftItem['status']) => Promise<void>;
  removeItem:       (listId: string, itemId: string) => Promise<void>;

  // AI + Amazon
  fetchAISuggestions: (params: GetSuggestionsParams & { budget: number }) => Promise<void>;
  clearSuggestions:   () => void;

  // Price tracking
  refreshItemPrice:   (listId: string, item: GiftItem) => Promise<void>;

  clearError: () => void;
}

export const useListsStore = create<ListsState>((set, get) => ({
  lists:           [],
  activeListItems: [],
  aiSuggestions:   [],
  isLoading:       false,
  isSuggestingAI:  false,
  error:           null,

  // ── Lists ────────────────────────────────────────────────────

  subscribe: (userId) => {
    return subscribeToLists(userId, (lists) => set({ lists }));
  },

  fetchLists: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const lists = await getLists(userId);
      set({ lists, isLoading: false });
    } catch (err: unknown) {
      set({ error: (err instanceof Error ? err.message : 'Failed to load lists'), isLoading: false });
    }
  },

  createList: async (userId, data) => {
    set({ isLoading: true, error: null });
    try {
      const list = await saveList(userId, data);
      set((state) => ({ lists: [list, ...state.lists], isLoading: false }));
      return list;
    } catch (err: unknown) {
      set({ error: (err instanceof Error ? err.message : 'Failed to create list'), isLoading: false });
      throw err;
    }
  },

  removeList: async (listId) => {
    try {
      await deleteList(listId);
      set((state) => ({ lists: state.lists.filter((l) => l.id !== listId) }));
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete list' });
      throw err;
    }
  },

  getListById: (id) => get().lists.find((l) => l.id === id),

  // ── Items ─────────────────────────────────────────────────────

  subscribeToItems: (listId) => {
    return subscribeToGiftItems(listId, (items) => set({ activeListItems: items }));
  },

  fetchItems: async (listId) => {
    set({ isLoading: true, error: null });
    try {
      const items = await getGiftItems(listId);
      set({ activeListItems: items, isLoading: false });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Failed to load items', isLoading: false });
    }
  },

  addItemToList: async (listId, itemData) => {
    try {
      const item = await saveGiftItem(listId, itemData);
      set((state) => ({ activeListItems: [...state.activeListItems, item] }));
      return item;
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Failed to add item' });
      throw err;
    }
  },

  updateItemStatus: async (listId, itemId, status) => {
    try {
      await updateGiftItemStatus(listId, itemId, status);
      set((state) => ({
        activeListItems: state.activeListItems.map((item) =>
          item.id === itemId ? { ...item, status } : item,
        ),
      }));
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Failed to update item' });
      throw err;
    }
  },

  removeItem: async (listId, itemId) => {
    try {
      await deleteGiftItem(listId, itemId);
      set((state) => ({
        activeListItems: state.activeListItems.filter((i) => i.id !== itemId),
      }));
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Failed to remove item' });
      throw err;
    }
  },

  // ── AI + Amazon ───────────────────────────────────────────────

  fetchAISuggestions: async (params) => {
    set({ isSuggestingAI: true, error: null, aiSuggestions: [] });
    try {
      // Step 1: Get AI suggestions
      const suggestions = await getAISuggestions(params);
      set({ aiSuggestions: suggestions });

      // Step 2: For each suggestion, search Amazon in parallel
      const enriched = await Promise.all(
        suggestions.map(async (s) => {
          try {
            const product = await findBestProductForKeywords(s.keywords, params.budget);
            return { ...s, amazonProduct: product ?? undefined, isLoading: false };
          } catch {
            return { ...s, isLoading: false };
          }
        }),
      );

      set({ aiSuggestions: enriched, isSuggestingAI: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : 'AI suggestions failed',
        isSuggestingAI: false,
      });
      throw err;
    }
  },

  clearSuggestions: () => set({ aiSuggestions: [] }),

  // ── Price tracking ────────────────────────────────────────────

  refreshItemPrice: async (listId, item) => {
    if (!item.asin) return;

    try {
      const priceData = await fetchPriceHistory(item.asin);
      if (!priceData) return;

      const priceUpdate = {
        amazonPrice:    priceData.currentPrice,
        allTimeLow:     priceData.allTimeLow,
        allTimeLowDate: priceData.allTimeLowDate,
        thirtyDayLow:   priceData.thirtyDayLow,
        ninetyDayLow:   priceData.ninetyDayLow,
        priceHistory:   priceData.priceHistory,
        lastPriceCheck: new Date(),
      };

      await updateGiftItemPrice(listId, item.id, priceUpdate);

      // Update local state
      set((state) => ({
        activeListItems: state.activeListItems.map((i) =>
          i.id === item.id ? { ...i, ...priceUpdate } : i,
        ),
      }));

      // Check for all-time low and send notification
      if (
        item.priceAlertEnabled &&
        isAtAllTimeLow(priceData.currentPrice, priceData.allTimeLow)
      ) {
        // Get recipient name from list store for the notification
        const list = get().lists.find((l) => l.id === listId);
        const recipientName = list?.recipient?.name ?? 'your recipient';
        await schedulePriceDropNotification(item.title, recipientName, priceData.currentPrice);
      }
    } catch (err) {
      console.warn('[ListsStore] refreshItemPrice error:', err);
    }
  },

  clearError: () => set({ error: null }),
}));
