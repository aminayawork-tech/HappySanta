// ─────────────────────────────────────────────────────────────
// HappySanta — Settings Store (Zustand + AsyncStorage)
// ─────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings } from '@/types';

interface SettingsState extends AppSettings {
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  theme:                    'festive-dark',
  musicEnabled:             false,   // Off by default (polite)
  snowEnabled:              true,
  pushNotificationsEnabled: true,
  priceAlertThreshold:      'all_time_low',
  currencySymbol:           '$',
  fcmToken:                 undefined,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateSetting: (key, value) => set({ [key]: value }),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name:    'happysanta-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
