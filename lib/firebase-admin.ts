import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.warn('Firebase Admin initialization failed.', error);
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
