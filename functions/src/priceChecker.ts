// ─────────────────────────────────────────────────────────────
// HappySanta — Price Checker Cloud Function
//
// Runs every 6 hours via Cloud Scheduler (pubsub trigger).
// For each active price alert:
//   1. Fetch current price from Keepa API
//   2. If at all-time low, send FCM push notification
//   3. Update price history in Firestore
//
// Deploy: firebase deploy --only functions
// ─────────────────────────────────────────────────────────────
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

// Initialize Firebase Admin (only once)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db  = admin.firestore();
const fcm = admin.messaging();

// ── Config ────────────────────────────────────────────────────
const KEEPA_API_KEY = functions.config().keepa?.api_key ?? process.env.KEEPA_API_KEY ?? '';
const KEEPA_BASE    = 'https://api.keepa.com';
const DOMAIN        = 1; // 1 = US

// ── Types ─────────────────────────────────────────────────────
interface PriceAlert {
  id:            string;
  userId:        string;
  itemId:        string;
  listId:        string;
  asin:          string;
  currentPrice:  number;
  allTimeLow:    number;
  recipientName: string;
  itemTitle:     string;
  isActive:      boolean;
}

interface KeepaStats {
  current?: number[];
  min?:     number[];
}

// ── Helpers ───────────────────────────────────────────────────

async function fetchKeepaPrice(asin: string): Promise<{
  currentPrice: number;
  allTimeLow:   number;
} | null> {
  try {
    const res = await axios.get(`${KEEPA_BASE}/product`, {
      params: {
        key:    KEEPA_API_KEY,
        domain: DOMAIN,
        asin,
        history: 0,  // No full history — just current stats (saves tokens)
        stats:   30,
      },
      timeout: 15000,
    });

    const product = res.data.products?.[0];
    if (!product) return null;

    const stats: KeepaStats = product.stats ?? {};
    const currentCents = stats.current?.[0] ?? -1;
    const minCents     = stats.min?.[0] ?? -1;

    if (currentCents < 0) return null;

    return {
      currentPrice: currentCents / 100,
      allTimeLow:   minCents > 0 ? minCents / 100 : currentCents / 100,
    };
  } catch (err) {
    console.error(`[Keepa] Error fetching ASIN ${asin}:`, err);
    return null;
  }
}

function isAtAllTimeLow(current: number, atl: number): boolean {
  if (atl <= 0 || current <= 0) return false;
  return current <= atl * 1.05; // within 5%
}

async function getUserFcmToken(userId: string): Promise<string | null> {
  const doc = await db.collection('users').doc(userId).get();
  return doc.data()?.fcmToken ?? null;
}

async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data: Record<string, string>,
): Promise<void> {
  await fcm.send({
    token,
    notification: { title, body },
    data,
    apns: {
      payload: {
        aps: {
          sound: 'jingle.wav',
          badge: 1,
        },
      },
    },
    android: {
      notification: {
        channelId: 'price-drop',
        sound:     'jingle',
      },
    },
  });
}

// ── Main Cron Function (every 6 hours) ───────────────────────

/**
 * Scheduled function that runs every 6 hours.
 * In Firebase Console: set up Cloud Scheduler to publish to
 * 'price-check' Pub/Sub topic every 6 hours.
 *
 * Or use the schedule shorthand: schedule('every 6 hours')
 */
export const priceCheckCron = functions
  .runWith({ timeoutSeconds: 540, memory: '512MB' })
  .pubsub.schedule('every 6 hours')
  .onRun(async () => {
    console.log('[PriceChecker] Starting price check run...');

    // Get all active price alerts
    const alertsSnap = await db
      .collection('priceAlerts')
      .where('isActive', '==', true)
      .get();

    if (alertsSnap.empty) {
      console.log('[PriceChecker] No active alerts. Done.');
      return;
    }

    const alerts: PriceAlert[] = alertsSnap.docs.map((d) => ({
      id: d.id,
      ...d.data() as Omit<PriceAlert, 'id'>,
    }));

    console.log(`[PriceChecker] Checking ${alerts.length} alerts...`);

    // Group by ASIN to avoid duplicate Keepa calls
    const asinMap = new Map<string, PriceAlert[]>();
    for (const alert of alerts) {
      const list = asinMap.get(alert.asin) ?? [];
      list.push(alert);
      asinMap.set(alert.asin, list);
    }

    // Process each ASIN
    for (const [asin, asinAlerts] of asinMap.entries()) {
      const priceData = await fetchKeepaPrice(asin);
      if (!priceData) continue;

      const { currentPrice, allTimeLow } = priceData;
      const isATL = isAtAllTimeLow(currentPrice, allTimeLow);

      // Update each alert's price in Firestore
      for (const alert of asinAlerts) {
        const batch = db.batch();

        // Update the item in the list
        const itemRef = db
          .collection('lists')
          .doc(alert.listId)
          .collection('items')
          .doc(alert.itemId);

        batch.update(itemRef, {
          amazonPrice:    currentPrice,
          allTimeLow,
          lastPriceCheck: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update the alert's current price
        const alertRef = db.collection('priceAlerts').doc(alert.id);
        batch.update(alertRef, { currentPrice });

        await batch.commit();

        // Send FCM notification if at all-time low
        if (isATL) {
          const fcmToken = await getUserFcmToken(alert.userId);
          if (fcmToken) {
            try {
              await sendPushNotification(
                fcmToken,
                '🎉 All-Time Low Price!',
                `${alert.itemTitle} for ${alert.recipientName} just hit $${currentPrice.toFixed(2)}! Tap to buy now 🎅`,
                {
                  type:    'price_drop',
                  listId:  alert.listId,
                  itemId:  alert.itemId,
                  asin,
                },
              );

              // Mark alert as triggered
              await alertRef.update({
                triggeredAt: admin.firestore.FieldValue.serverTimestamp(),
              });

              // Create in-app notification
              await db.collection('notifications').add({
                userId:    alert.userId,
                type:      'all_time_low',
                title:     '🎉 All-Time Low Price!',
                body:      `${alert.itemTitle} for ${alert.recipientName} just hit $${currentPrice.toFixed(2)}!`,
                data:      { listId: alert.listId, itemId: alert.itemId },
                isRead:    false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
              });

              console.log(`[PriceChecker] Sent ATL alert for ASIN ${asin} to user ${alert.userId}`);
            } catch (err) {
              console.error(`[PriceChecker] FCM error for ${alert.userId}:`, err);
            }
          }
        }
      }

      // Small delay between ASINs to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log('[PriceChecker] Run complete.');
  });

// ── HTTP trigger for manual testing ──────────────────────────

/**
 * HTTP function to manually trigger a price drop alert for testing.
 * Call: POST https://[region]-[project].cloudfunctions.net/sendPriceDropAlert
 * Body: { userId, itemTitle, recipientName, price, listId, itemId }
 */
export const sendPriceDropAlert = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { userId, itemTitle, recipientName, price, listId, itemId } = req.body;

  if (!userId || !itemTitle) {
    res.status(400).json({ error: 'userId and itemTitle required' });
    return;
  }

  const fcmToken = await getUserFcmToken(userId);
  if (!fcmToken) {
    res.status(404).json({ error: 'No FCM token for user' });
    return;
  }

  await sendPushNotification(
    fcmToken,
    '🎉 Price Drop Alert!',
    `${itemTitle} for ${recipientName} is now $${price}! 🎅`,
    { type: 'price_drop', listId, itemId },
  );

  res.json({ success: true });
});
