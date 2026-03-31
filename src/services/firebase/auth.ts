// ─────────────────────────────────────────────────────────────
// HappySanta — Firebase Auth Service
// Handles email/password + Google sign-in, profile management.
// ─────────────────────────────────────────────────────────────
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from './config';
import { createOrUpdateUserDoc } from './firestore';
import type { User } from '@/types';

// Configure Google Sign-In once (called from App.tsx)
export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId:     process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
    iosClientId:     process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
    offlineAccess: false,
  });
}

// ── Map Firebase user → app User ──────────────────────────────

export function mapFirebaseUser(fbUser: FirebaseUser): User {
  return {
    uid:         fbUser.uid,
    email:       fbUser.email,
    displayName: fbUser.displayName,
    photoURL:    fbUser.photoURL,
    createdAt:   fbUser.metadata.creationTime
      ? new Date(fbUser.metadata.creationTime)
      : new Date(),
    updatedAt: new Date(),
  };
}

// ── Auth operations ───────────────────────────────────────────

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  const user = mapFirebaseUser(credential.user);
  await createOrUpdateUserDoc(user);
  return user;
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = mapFirebaseUser(credential.user);
  await createOrUpdateUserDoc(user);
  return user;
}

export async function loginWithGoogle(): Promise<User> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const { data } = await GoogleSignin.signIn();
  if (!data?.idToken) throw new Error('Google sign-in: no idToken');

  const googleCredential = GoogleAuthProvider.credential(data.idToken);
  const credential = await signInWithCredential(auth, googleCredential);
  const user = mapFirebaseUser(credential.user);
  await createOrUpdateUserDoc(user);
  return user;
}

export async function signOut(): Promise<void> {
  // Sign out from Google too (prevents auto-re-login on next attempt)
  try { await GoogleSignin.signOut(); } catch { /* not signed in via Google */ }
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/** Subscribe to auth state changes; returns unsubscribe fn */
export function subscribeToAuthState(
  callback: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      const user = mapFirebaseUser(fbUser);
      callback(user);
    } else {
      callback(null);
    }
  });
}
