// ─────────────────────────────────────────────────────────────
// HappySanta — Recipients Store (Zustand)
// ─────────────────────────────────────────────────────────────
import { create } from 'zustand';
import {
  saveRecipient,
  getRecipients,
  deleteRecipient,
  subscribeToRecipients,
} from '@/services/firebase/firestore';
import type { Recipient } from '@/types';

interface RecipientsState {
  recipients:   Recipient[];
  isLoading:    boolean;
  error:        string | null;

  // Actions
  subscribe:       (userId: string) => () => void;
  fetchRecipients: (userId: string) => Promise<void>;
  addRecipient:    (userId: string, recipient: Omit<Recipient, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Recipient>;
  updateRecipient: (userId: string, recipient: Recipient) => Promise<void>;
  removeRecipient: (recipientId: string) => Promise<void>;
  getById:         (id: string) => Recipient | undefined;
  clearError:      () => void;
}

export const useRecipientsStore = create<RecipientsState>((set, get) => ({
  recipients: [],
  isLoading:  false,
  error:      null,

  subscribe: (userId) => {
    return subscribeToRecipients(userId, (recipients) => {
      set({ recipients });
    });
  },

  fetchRecipients: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const recipients = await getRecipients(userId);
      set({ recipients, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load recipients';
      set({ error: message, isLoading: false });
    }
  },

  addRecipient: async (userId, recipientData) => {
    set({ isLoading: true, error: null });
    try {
      const saved = await saveRecipient(userId, recipientData);
      set((state) => ({
        recipients: [saved, ...state.recipients],
        isLoading:  false,
      }));
      return saved;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add recipient';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateRecipient: async (userId, recipient) => {
    set({ error: null });
    try {
      const updated = await saveRecipient(userId, recipient);
      set((state) => ({
        recipients: state.recipients.map((r) =>
          r.id === updated.id ? updated : r,
        ),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update recipient';
      set({ error: message });
      throw err;
    }
  },

  removeRecipient: async (recipientId) => {
    set({ error: null });
    try {
      await deleteRecipient(recipientId);
      set((state) => ({
        recipients: state.recipients.filter((r) => r.id !== recipientId),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete recipient';
      set({ error: message });
      throw err;
    }
  },

  getById: (id) => get().recipients.find((r) => r.id === id),

  clearError: () => set({ error: null }),
}));
