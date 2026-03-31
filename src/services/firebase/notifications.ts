// ─────────────────────────────────────────────────────────────
// HappySanta — Push Notifications Service (Expo + FCM)
// ─────────────────────────────────────────────────────────────
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS, NOTIFICATION_CHANNELS } from '@/utils/constants';

// ── Configure notification behaviour ─────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:   true,
    shouldPlaySound:   true,
    shouldSetBadge:    true,
    shouldShowBanner:  true,
    shouldShowList:    true,
  }),
});

// ── Android channels ──────────────────────────────────────────

export async function setupAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.priceDrop, {
    name: '🎉 Price Drops',
    description: 'Notified when a gift drops to its all-time lowest price',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#C41E3A',
    sound: 'jingle.wav',
  });

  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.listReminder, {
    name: '🎄 Christmas Reminders',
    description: 'Reminders to finish your gift lists',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

// ── Request permissions + get token ──────────────────────────

export async function registerForPushNotifications(userId: string): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('[Notifications] Push notifications only work on physical devices.');
    return null;
  }

  await setupAndroidChannels();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Notifications] Push notification permission denied.');
    return null;
  }

  // Get Expo push token (works for Expo Go + bare workflows)
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.warn('[Notifications] No EAS project ID found in app.json.');
    return null;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

  // Save token to Firestore for server-side sending
  await updateDoc(doc(db, COLLECTIONS.users, userId), {
    fcmToken:        token,
    fcmTokenUpdated: new Date().toISOString(),
  });

  return token;
}

// ── Local notification helpers ────────────────────────────────

/** Schedule a local notification immediately */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: 'jingle.wav' },
    trigger: null, // Fire immediately
  });
}

/** Schedule a price-drop celebration notification */
export async function schedulePriceDropNotification(
  itemTitle: string,
  recipientName: string,
  price: number,
): Promise<void> {
  await sendLocalNotification(
    '🎉 All-Time Low Price Alert!',
    `${itemTitle} for ${recipientName} just hit $${price.toFixed(2)} — the cheapest it's ever been! 🎅`,
    { type: 'price_drop' },
  );
}

// ── Listen for notifications ──────────────────────────────────

/** Call this in your root component to respond to taps on notifications */
export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void,
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

export function addNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void,
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(handler);
}
