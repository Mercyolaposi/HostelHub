import { auth } from './firebase';
import * as Sentry from "@sentry/nextjs";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string;
    email: string | null;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  } | null;
}

/**
 * Standardizes Firestore error reporting.
 * Throws a JSON string of FirestoreErrorInfo if it's a permission error.
 * Use this in all catch blocks that interface with Firestore.
 */
export function handleFirestoreError(
  error: any,
  operationType: OperationType,
  path: string | null = null
): never {
  const user = auth.currentUser;
  
  const errorInfo: FirestoreErrorInfo = {
    error: error?.message || 'Unknown Firestore error',
    operationType,
    path,
    authInfo: user ? {
      userId: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      isAnonymous: user.isAnonymous,
      providerInfo: user.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || '',
      })),
    } : null,
  };

  Sentry.withScope((scope) => {
    scope.setExtra("operationType", operationType);
    scope.setExtra("path", path);
    scope.setExtra("authInfo", errorInfo.authInfo || "unauthenticated");
    Sentry.captureException(error);
  });

  // Check for permission denied errors specifically
  if (
    error?.code === 'permission-denied' || 
    error?.code === 'firestore/permission-denied' ||
    error?.message?.toLowerCase().includes('permission') ||
    error?.message?.toLowerCase().includes('insufficient')
  ) {
    const jsonError = JSON.stringify(errorInfo);
    console.error('🔥 [PRO-DEV DIAGNOSTICS] Firestore Permission Denied:', jsonError);
    
    // Create a new error with the JSON payload so the UI can parse it
    const enhancedError = new Error(jsonError);
    (enhancedError as any).code = 'permission-denied';
    throw enhancedError;
  }

  // Rethrow if not a permission error, but still logged
  console.error(`❌ Firestore ${operationType} error at ${path}:`, error);
  throw error;
}
