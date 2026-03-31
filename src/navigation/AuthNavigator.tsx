// ─────────────────────────────────────────────────────────────
// HappySanta — Auth Stack Navigator
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { WelcomeScreen }    from '@/screens/auth/WelcomeScreen';
import { LoginScreen }      from '@/screens/auth/LoginScreen';
import { RegisterScreen }   from '@/screens/auth/RegisterScreen';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';

const Stack = createNativeStackNavigator();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animation:   'slide_from_right',
      }}
    >
      <Stack.Screen name="Welcome"    component={WelcomeScreen}    />
      <Stack.Screen name="Login"      component={LoginScreen}      />
      <Stack.Screen name="Register"   component={RegisterScreen}   />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
}
