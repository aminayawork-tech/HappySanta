// ─────────────────────────────────────────────────────────────
// HappySanta — Firestore Service
// All read/write helpers for users, recipients, lists, items,
// price alerts, and notifications.
// ─────────────────────────────────────────────────────────────
import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from '@/utils/constants';
import { generateShareToken } from '@/utils/helpers';
import type {
  User,
  Recipient,
  GiftList,
  GiftItem,
  PriceAlert,
  AppNotification,
} from '@/types';

// ── Converters ────────────────────────────────────────────────

function tsToDate(ts: Timestamp | Date | undefined): Date {
  if (!ts) return new Date();
  if (ts instanceof Timestamp) return ts.toDate();
  return ts;
}

// ── Users ─────────────────────────────────────────────────────

export async function createOrUpdateUserDoc(user: User): Promise<void> {
  const ref = doc(db, COLLECTIONS.users, user.uid);
  await setDoc(
    ref,
    {
      uid:         user.uid,
      email:       user.email,
      displayName: user.displayName,
      photoURL:    user.photoURL,
      updatedAt:   serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getUserDoc(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.users, uid));
  if (!snap.exists()) return null;
  const d = snap.data() as DocumentData;
  return {
    uid:         d.uid,
    email:       d.email,
    displayName: d.displayName,
    photoURL:    d.photoURL,
    createdAt:   tsToDate(d.createdAt),
    updatedAt:   tsToDate(d.updatedAt),
  };
}

// ── Recipients ────────────────────────────────────────────────

export async function saveRecipient(
  userId: string,
  recipient: Omit<Recipient, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<Recipient> {
  const isNew = !recipient.id;
  const ref = isNew
    ? doc(collection(db, COLLECTIONS.recipients))
    : doc(db, COLLECTIONS.recipients, recipient.id!);

  const data = {
    ...recipient,
    userId,
    updatedAt: serverTimestamp(),
    ...(isNew ? { createdAt: serverTimestamp() } : {}),
  };

  await setDoc(ref, data, { merge: true });

  return {
    ...recipient,
    id:        ref.id,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getRecipients(userId: string): Promise<Recipient[]> {
  const q = query(
    collection(db, COLLECTIONS.recipients),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as DocumentData;
    return {
      ...data,
      id:        d.id,
      createdAt: tsToDate(data.createdAt),
      updatedAt: tsToDate(data.updatedAt),
    } as Recipient;
  });
}

export function subscribeToRecipients(
  userId: string,
  callback: (recipients: Recipient[]) => void,
): () => void {
  const q = query(
    collection(db, COLLECTIONS.recipients),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(q, (snap: QuerySnapshot) => {
    const recipients = snap.docs.map((d) => {
      const data = d.data() as DocumentData;
      return {
        ...data,
        id:        d.id,
        createdAt: tsToDate(data.createdAt),
        updatedAt: tsToDate(data.updatedAt),
      } as Recipient;
    });
    callback(recipients);
  });
}

export async function deleteRecipient(recipientId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.recipients, recipientId));
}

// ── Gift Lists ────────────────────────────────────────────────

export async function saveList(
  userId: string,
  list: Omit<GiftList, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'items' | 'totalSpent'> & { id?: string },
): Promise<GiftList> {
  const isNew = !list.id;
  const ref = isNew
    ? doc(collection(db, COLLECTIONS.lists))
    : doc(db, COLLECTIONS.lists, list.id!);

  const shareToken = list.shareToken ?? generateShareToken();

  const data = {
    ...list,
    userId,
    shareToken,
    updatedAt: serverTimestamp(),
    ...(isNew ? { createdAt: serverTimestamp() } : {}),
  };

  await setDoc(ref, data, { merge: true });

  return {
    ...list,
    id:         ref.id,
    userId,
    shareToken,
    items:      [],
    totalSpent: 0,
    createdAt:  new Date(),
    updatedAt:  new Date(),
  };
}

export async function getLists(userId: string): Promise<GiftList[]> {
  const q = query(
    collection(db, COLLECTIONS.lists),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as DocumentData;
    return {
      ...data,
      id:        d.id,
      items:     [],
      createdAt: tsToDate(data.createdAt),
      updatedAt: tsToDate(data.updatedAt),
    } as GiftList;
  });
}

export function subscribeToLists(
  userId: string,
  callback: (lists: GiftList[]) => void,
): () => void {
  const q = query(
    collection(db, COLLECTIONS.lists),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    const lists = snap.docs.map((d) => {
      const data = d.data() as DocumentData;
      return {
        ...data,
        id:        d.id,
        items:     [],
        createdAt: tsToDate(data.createdAt),
        updatedAt: tsToDate(data.updatedAt),
      } as GiftList;
    });
    callback(lists);
  });
}

export async function deleteList(listId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.lists, listId));
}

// ── Gift Items (subcollection under lists) ────────────────────

export async function saveGiftItem(
  listId: string,
  item: Omit<GiftItem, 'id' | 'listId' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<GiftItem> {
  const isNew = !item.id;
  const ref = isNew
    ? doc(collection(db, COLLECTIONS.lists, listId, COLLECTIONS.items))
    : doc(db, COLLECTIONS.lists, listId, COLLECTIONS.items, item.id!);

  const data = {
    ...item,
    listId,
    updatedAt: serverTimestamp(),
    ...(isNew ? { createdAt: serverTimestamp() } : {}),
  };

  await setDoc(ref, data, { merge: true });

  return {
    ...item,
    id:        ref.id,
    listId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getGiftItems(listId: string): Promise<GiftItem[]> {
  const snap = await getDocs(
    collection(db, COLLECTIONS.lists, listId, COLLECTIONS.items),
  );
  return snap.docs.map((d) => {
    const data = d.data() as DocumentData;
    return {
      ...data,
      id:        d.id,
      createdAt: tsToDate(data.createdAt),
      updatedAt: tsToDate(data.updatedAt),
    } as GiftItem;
  });
}

export function subscribeToGiftItems(
  listId: string,
  callback: (items: GiftItem[]) => void,
): () => void {
  return onSnapshot(
    collection(db, COLLECTIONS.lists, listId, COLLECTIONS.items),
    (snap) => {
      const items = snap.docs.map((d) => {
        const data = d.data() as DocumentData;
        return {
          ...data,
          id:        d.id,
          createdAt: tsToDate(data.createdAt),
          updatedAt: tsToDate(data.updatedAt),
        } as GiftItem;
      });
      callback(items);
    },
  );
}

export async function updateGiftItemStatus(
  listId: string,
  itemId: string,
  status: GiftItem['status'],
): Promise<void> {
  await updateDoc(
    doc(db, COLLECTIONS.lists, listId, COLLECTIONS.items, itemId),
    { status, updatedAt: serverTimestamp() },
  );
}

export async function updateGiftItemPrice(
  listId: string,
  itemId: string,
  priceData: Partial<Pick<GiftItem, 'amazonPrice' | 'allTimeLow' | 'allTimeLowDate' | 'thirtyDayLow' | 'ninetyDayLow' | 'priceHistory' | 'lastPriceCheck'>>,
): Promise<void> {
  await updateDoc(
    doc(db, COLLECTIONS.lists, listId, COLLECTIONS.items, itemId),
    { ...priceData, updatedAt: serverTimestamp() },
  );
}

export async function deleteGiftItem(listId: string, itemId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.lists, listId, COLLECTIONS.items, itemId));
}

// ── Price Alerts ──────────────────────────────────────────────

export async function savePriceAlert(alert: Omit<PriceAlert, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.priceAlerts), {
    ...alert,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getPriceAlertsForUser(userId: string): Promise<PriceAlert[]> {
  const q = query(
    collection(db, COLLECTIONS.priceAlerts),
    where('userId', '==', userId),
    where('isActive', '==', true),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as DocumentData;
    return {
      ...data,
      id:        d.id,
      createdAt: tsToDate(data.createdAt),
    } as PriceAlert;
  });
}

// ── Notifications ─────────────────────────────────────────────

export function subscribeToNotifications(
  userId: string,
  callback: (notifs: AppNotification[]) => void,
): () => void {
  const q = query(
    collection(db, COLLECTIONS.notifications),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    const notifs = snap.docs.map((d) => {
      const data = d.data() as DocumentData;
      return {
        ...data,
        id:        d.id,
        createdAt: tsToDate(data.createdAt),
      } as AppNotification;
    });
    callback(notifs);
  });
}

export async function markNotificationRead(notifId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.notifications, notifId), { isRead: true });
}
