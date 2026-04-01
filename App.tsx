// ─────────────────────────────────────────────────────────────
// HappySanta 🎅 — Root Application Component
// ─────────────────────────────────────────────────────────────
import './global.css'; // NativeWind v4 — must be first import
import React, { useEffect, useCallback } from 'react';
import { StatusBar, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import {
  useFonts,
  LobsterTwo_400Regular,
  LobsterTwo_700Bold,
} from '@expo-google-fonts/lobster-two';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import Toast from 'react-native-toast-message';

import { AppNavigator } from '@/navigation/AppNavigator';
import { configureGoogleSignIn } from '@/services/firebase/auth';
import {
  addNotificationResponseListener,
  addNotificationReceivedListener,
} from '@/services/firebase/notifications';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// ── Configure Google Sign-In globally ─────────────────────────
configureGoogleSignIn();

export default function App() {
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    LobsterTwo_400Regular,
    LobsterTwo_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  // Hide splash once fonts are ready
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // ── Push notification listeners ──────────────────────────
  useEffect(() => {
    // Received while app is foregrounded
    const foregroundSub = addNotificationReceivedListener((notification) => {
      console.log('[Notification] Received in foreground:', notification.request.content.title);
    });

    // User tapped a notification
    const responseSub = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data as Record<string, string>;
      console.log('[Notification] User tapped notification:', data);
      // TODO: navigate to the relevant list/item based on data.listId / data.itemId
      // You can use a navigation ref here:
      // navigationRef.current?.navigate('ListDetail', { listId: data.listId });
    });

    return () => {
      foregroundSub.remove();
      responseSub.remove();
    };
  }, []);

  // Don't render anything until fonts load (splash stays visible)
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent={Platform.OS === 'android'}
        />
        <AppNavigator />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
