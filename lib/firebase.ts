import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-config.json';

// Initialize Firebase SDK
// We use getApps().length to prevent re-initializing the app during hot reloads in Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with the specific database ID if provided in the config
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
