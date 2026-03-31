// ─────────────────────────────────────────────────────────────
// HappySanta — Auth Store (Zustand)
// ─────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  signOut,
  resetPassword,
  subscribeToAuthState,
} from '@/services/firebase/auth';
import { registerForPushNotifications } from '@/services/firebase/notifications';
import type { User } from '@/types';

interface AuthState {
  user:         User | null;
  isLoading:    boolean;
  isInitialized:boolean;
  error:        string | null;

  // Actions
  initialize:         () => () => void;  // returns unsubscribe fn
  loginWithEmail:     (email: string, password: string) => Promise<void>;
  loginWithGoogle:    () => Promise<void>;
  register:           (email: string, password: string, name: string) => Promise<void>;
  logout:             () => Promise<void>;
  resetPassword:      (email: string) => Promise<void>;
  clearError:         () => void;
  setUser:            (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:          null,
      isLoading:     false,
      isInitialized: false,
      error:         null,

      // Subscribe to Firebase auth state changes
      initialize: () => {
        const unsubscribe = subscribeToAuthState((user) => {
          set({ user, isInitialized: true, isLoading: false });

          // Register for push notifications after sign-in
          if (user) {
            registerForPushNotifications(user.uid).catch(console.warn);
          }
        });
        return unsubscribe;
      },

      loginWithEmail: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const user = await loginWithEmail(email, password);
          set({ user, isLoading: false });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Login failed';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await loginWithGoogle();
          set({ user, isLoading: false });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Google sign-in failed';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          const user = await registerWithEmail(email, password, name);
          set({ user, isLoading: false });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Registration failed';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await signOut();
          set({ user: null, isLoading: false });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Sign out failed';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await resetPassword(email);
          set({ isLoading: false });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Password reset failed';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      clearError: () => set({ error: null }),
      setUser:    (user) => set({ user }),
    }),
    {
      name:    'happysanta-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the user object (not loading states)
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
