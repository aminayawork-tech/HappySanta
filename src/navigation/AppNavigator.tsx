// ─────────────────────────────────────────────────────────────
// HappySanta — Root Navigator
// Handles auth gate: shows Auth stack when signed out,
// Main tabs + modal screens when signed in.
// ─────────────────────────────────────────────────────────────
import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuthStore } from '@/store/authStore';
import { COLORS } from '@/utils/constants';

import { AuthNavigator } from './AuthNavigator';
import { TabNavigator }  from './TabNavigator';

// Screens layered on top of tabs
import { RecipientDetailScreen } from '@/screens/recipients/RecipientDetailScreen';
import { AddRecipientScreen }    from '@/screens/recipients/AddRecipientScreen';
import { ListDetailScreen }      from '@/screens/lists/ListDetailScreen';
import { CreateListScreen }      from '@/screens/lists/CreateListScreen';
import { AISuggestionsScreen }   from '@/screens/lists/AISuggestionsScreen';
import { ProductDetailScreen }   from '@/screens/product/ProductDetailScreen';
import { SettingsScreen }        from '@/screens/settings/SettingsScreen';

import type { RootStackParamList } from '@/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const HappySantaTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary:    COLORS.santaRed,
    background: COLORS.bgDark,
    card:       COLORS.bgCard,
    text:       COLORS.textPrimary,
    border:     COLORS.bgInput,
    notification: COLORS.santaRed,
  },
};

export function AppNavigator() {
  const { user, isInitialized, initialize } = useAuthStore();

  // Subscribe to Firebase Auth state on mount
  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  // Splash / loading state while Firebase initialises
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bgDark, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.santaRed} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={HappySantaTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown:       false,
          animation:         'slide_from_right',
          contentStyle:      { backgroundColor: COLORS.bgDark },
        }}
      >
        {!user ? (
          // ── Auth group ─────────────────────────────────────
          <Stack.Screen name="Welcome" component={AuthNavigator} />
        ) : (
          // ── Authenticated group ────────────────────────────
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />

            <Stack.Screen
              name="RecipientDetail"
              component={RecipientDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="AddRecipient"
              component={AddRecipientScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="ListDetail"
              component={ListDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="CreateList"
              component={CreateListScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="AISuggestions"
              component={AISuggestionsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
