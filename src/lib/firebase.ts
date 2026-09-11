import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  onSnapshot,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const STORAGE_KEY_FIREBASE_CONFIG = 'nicole_firebase_custom_config_v2';
const STORAGE_KEY_HOUSEHOLD_KEY = 'nicole_firebase_household_key_v2';

export function getSavedHouseholdKey(): string {
  if (typeof window === 'undefined') return 'nicole-keller';
  return localStorage.getItem(STORAGE_KEY_HOUSEHOLD_KEY) || 'nicole-keller';
}

export function saveHouseholdKey(key: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_HOUSEHOLD_KEY, key.trim() || 'nicole-keller');
}

export function getSavedCustomFirebaseConfig(): FirebaseClientConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse custom firebase config', e);
  }
  return null;
}

export function saveCustomFirebaseConfig(config: FirebaseClientConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
}

export function getEffectiveFirebaseConfig(): FirebaseClientConfig | null {
  // 1. Check custom user config from Settings (useful if not using .env)
  const custom = getSavedCustomFirebaseConfig();
  if (custom && custom.apiKey && custom.projectId) {
    return custom;
  }

  // 2. Check Next.js Environment Variables (standard way)
  if (
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  ) {
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
  }

  return null;
}

export function isFirebaseConfigured(): boolean {
  const cfg = getEffectiveFirebaseConfig();
  return Boolean(cfg && cfg.apiKey && cfg.projectId);
}

let cachedDb: Firestore | null = null;

export function getFirebaseDb(): Firestore | null {
  if (typeof window === 'undefined') return null;
  if (cachedDb) return cachedDb;

  const config = getEffectiveFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    const app: FirebaseApp =
      getApps().length > 0 ? getApp() : initializeApp(config as any);
    cachedDb = getFirestore(app);
    return cachedDb;
  } catch (e) {
    console.error('Failed to initialize Firebase', e);
    return null;
  }
}

export interface CloudUserData {
  weeklyPlan?: any;
  shoppingItems?: any;
  favorites?: string[];
  recipeNotes?: Record<string, string>;
  customRecipes?: any;
  updatedAt?: any;
}

/**
 * Realtime Sync Listener:
 * Hört auf Änderungen in Firestore (z. B. wenn am Handy etwas abgehakt wird)
 * und benachrichtigt die App in Echtzeit.
 */
export function subscribeToCloudSync(
  householdKey: string,
  onRemoteChange: (data: CloudUserData, isFromRemote: boolean) => void
): () => void {
  const db = getFirebaseDb();
  if (!db) return () => {};

  const cleanKey = (householdKey || 'nicole-keller').trim().toLowerCase();
  const docRef = doc(db, 'households', cleanKey);

  try {
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        const isFromRemote = !snap.metadata.hasPendingWrites;
        if (snap.exists()) {
          const data = snap.data() as CloudUserData;
          onRemoteChange(data, isFromRemote);
        } else {
          // Document does not exist yet
          onRemoteChange({}, isFromRemote);
        }
      },
      (err) => {
        console.warn('Firestore subscription warning (offline or permissions?):', err);
      }
    );
    return unsubscribe;
  } catch (e) {
    console.error('Failed to attach Firestore snapshot', e);
    return () => {};
  }
}

/**
 * Speichert Daten in Firestore in die 'households/{cleanKey}' Document-Collection.
 * Entfernt automatisch undefined-Werte (da Firestore sonst einen Fehler wirft).
 */
export async function pushDataToCloud(
  householdKey: string,
  dataToSave: Partial<CloudUserData>
): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('pushDataToCloud: Firebase DB is not initialized.');
    return false;
  }

  const cleanKey = (householdKey || 'nicole-keller').trim().toLowerCase();
  const docRef = doc(db, 'households', cleanKey);

  try {
    // Strips any undefined fields which Firestore strictly forbids
    const sanitized = JSON.parse(JSON.stringify(dataToSave));
    
    await setDoc(
      docRef,
      {
        ...sanitized,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (e) {
    console.error('Failed to push data to cloud Firestore:', e);
    return false;
  }
}

