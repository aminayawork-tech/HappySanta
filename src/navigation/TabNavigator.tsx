// ─────────────────────────────────────────────────────────────
// HappySanta — Bottom Tab Navigator
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { HomeScreen }       from '@/screens/home/HomeScreen';
import { ListsScreen }      from '@/screens/lists/ListsScreen';
import { RecipientsScreen } from '@/screens/recipients/RecipientsScreen';
import { ProfileScreen }    from '@/screens/settings/ProfileScreen';
import { COLORS }           from '@/utils/constants';

const Tab = createBottomTabNavigator();

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  name,
  focused,
  label,
}: {
  name: TabIconName;
  focused: boolean;
  label: string;
}) {
  return (
    <View style={styles.tabIconContainer}>
      <Ionicons
        name={name}
        size={24}
        color={focused ? COLORS.santaRed : COLORS.textMuted}
      />
      <Text style={[styles.tabLabel, { color: focused ? COLORS.santaRed : COLORS.textMuted }]}>
        {label}
      </Text>
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.bgCard }]} />
          ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} label="Home" />
          ),
        }}
      />
      <Tab.Screen
        name="Lists"
        component={ListsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'gift' : 'gift-outline'} focused={focused} label="Lists" />
          ),
        }}
      />
      <Tab.Screen
        name="Recipients"
        component={RecipientsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'people' : 'people-outline'}
              focused={focused}
              label="Family"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'person' : 'person-outline'}
              focused={focused}
              label="Profile"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    elevation:       0,
    borderTopWidth:  1,
    borderTopColor:  'rgba(255,255,255,0.08)',
    height:          Platform.OS === 'ios' ? 85 : 65,
    paddingBottom:   Platform.OS === 'ios' ? 20 : 8,
  },
  tabIconContainer: {
    alignItems:     'center',
    justifyContent: 'center',
    paddingTop:     8,
  },
  tabLabel: {
    fontSize:   10,
    marginTop:  3,
    fontWeight: '600',
  },
});
