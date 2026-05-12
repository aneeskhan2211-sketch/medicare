import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getMessaging, Messaging } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId || '(default)');

// Re-export OperationType to avoid circular dependency
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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  const jsonError = JSON.stringify(errInfo);
  console.error('Firestore Error: ', jsonError);
  throw new Error(jsonError);
}

let messagingInstance: Messaging | undefined;
try {
  messagingInstance = getMessaging(app);
} catch (e) {
  console.warn("Firebase Messaging not supported in this environment (likely SSR or non-https)");
}

export const messaging = messagingInstance;

// VAPID Key (User should replace this with their actual key from Firebase Console)
export const VAPID_KEY = 'YOUR_VAPID_PUBLIC_KEY';

// Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Helper to test connection
async function testConnection() {
  try {
    // Small delay to ensure everything is initialized
    await new Promise(resolve => setTimeout(resolve, 1000));
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('unavailable'))) {
      console.warn("Firestore connection check failed: Backend might be unavailable or project just created. This is often temporary.");
    } else if (error instanceof Error && error.message.includes('permission-denied')) {
       // This is expected if 'test/connection' doesn't exist or isn't readable, 
       // but it confirms we DID reach the backend.
       console.log("Firestore connection verified (reached backend)");
    } else {
      console.error("Firestore connection error:", error);
    }
  }
}
testConnection();
