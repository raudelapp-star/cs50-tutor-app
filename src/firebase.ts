import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Validate connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

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
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const initAuth = (
  onUserChanged: (user: User | null, token: string | null) => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (!user && !isSigningIn) {
      cachedAccessToken = null;
    }
    onUserChanged(user, cachedAccessToken);
  });
};

export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string | null;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    await ensureUserProfile(result.user);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Sanitize ID to match ^[a-zA-Z0-9_\-]+$ and maxLength 128
export function sanitizeDocId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128) || 'doc_default';
}

export async function ensureUserProfile(user: User) {
  const userPath = `users/${user.uid}`;
  const ref = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid.slice(0, 128),
        displayName: (user.displayName || 'Estudiante CS50').slice(0, 100),
        currentModuleId: 'module-0',
        currentLevel: 1,
        streakDays: 1,
        totalStudyMinutes: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export async function updateUserProfileState(
  uid: string,
  updates: {
    displayName?: string;
    currentModuleId?: string;
    currentLevel?: number;
    streakDays?: number;
    totalStudyMinutes?: number;
  }
) {
  const userPath = `users/${uid}`;
  const ref = doc(db, 'users', uid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const existing = snap.data();
    await updateDoc(ref, {
      displayName: (updates.displayName ?? existing.displayName ?? 'Estudiante CS50').slice(0, 100),
      currentModuleId: (updates.currentModuleId ?? existing.currentModuleId ?? 'module-0').slice(0, 64),
      currentLevel: Math.min(4, Math.max(1, Math.round(updates.currentLevel ?? existing.currentLevel ?? 1))),
      streakDays: Math.max(0, Math.round(updates.streakDays ?? existing.streakDays ?? 1)),
      totalStudyMinutes: Math.max(0, Math.round(updates.totalStudyMinutes ?? existing.totalStudyMinutes ?? 0)),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}

export async function saveTopicProgressDoc(
  uid: string,
  moduleId: string,
  data: {
    topicName: string;
    status: 'pending' | 'in_progress' | 'mastered';
    socraticLevel: number;
    attempts: number;
    hintsUsed: number;
    intervalDays: number;
    nextReviewDate: string;
  }
) {
  const docId = sanitizeDocId(`${uid}_${moduleId}`);
  const path = `topicProgress/${docId}`;
  const ref = doc(db, 'topicProgress', docId);
  try {
    const snap = await getDoc(ref);
    const payload = {
      moduleId: moduleId.slice(0, 64),
      topicName: data.topicName.slice(0, 120),
      status: data.status,
      socraticLevel: Math.min(4, Math.max(1, Math.round(data.socraticLevel))),
      attempts: Math.max(0, Math.round(data.attempts)),
      hintsUsed: Math.max(0, Math.round(data.hintsUsed)),
      intervalDays: Math.min(3650, Math.max(0, Math.round(data.intervalDays))),
      nextReviewDate: data.nextReviewDate.slice(0, 40),
      updatedAt: serverTimestamp(),
    };

    if (!snap.exists()) {
      await setDoc(ref, {
        ownerId: uid,
        ...payload,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, payload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function logRecurrentErrorDoc(
  uid: string,
  moduleId: string,
  errorCategory: string,
  causeDescription: string
) {
  const cleanCat = errorCategory.trim().slice(0, 80) || 'logical-error';
  const docId = sanitizeDocId(`${uid}_${moduleId}_${cleanCat}`);
  const path = `errorRecords/${docId}`;
  const ref = doc(db, 'errorRecords', docId);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        ownerId: uid,
        moduleId: moduleId.slice(0, 64),
        errorCategory: cleanCat,
        causeDescription: causeDescription.slice(0, 600) || 'Error conceptual detectado en práctica',
        occurrences: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const prev = snap.data();
      await updateDoc(ref, {
        causeDescription: causeDescription.slice(0, 600) || prev.causeDescription,
        occurrences: Math.min(100000, (prev.occurrences || 1) + 1),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveTutorSessionDoc(
  uid: string,
  moduleId: string,
  messagesJson: string,
  markdownSummary: string
) {
  const docId = sanitizeDocId(`${uid}_${moduleId}_session`);
  const path = `tutorSessions/${docId}`;
  const ref = doc(db, 'tutorSessions', docId);
  try {
    const snap = await getDoc(ref);
    const safeMessages = messagesJson.slice(0, 49000) || '[]';
    const safeMarkdown = markdownSummary.slice(0, 9500) || '# Progreso CS50';
    if (!snap.exists()) {
      await setDoc(ref, {
        ownerId: uid,
        moduleId: moduleId.slice(0, 64),
        messagesJson: safeMessages,
        markdownSummary: safeMarkdown,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        moduleId: moduleId.slice(0, 64),
        messagesJson: safeMessages,
        markdownSummary: safeMarkdown,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteErrorRecordDoc(docId: string) {
  const path = `errorRecords/${docId}`;
  try {
    await deleteDoc(doc(db, 'errorRecords', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function loadUserProfileDoc(uid: string) {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function loadTutorSessionDoc(uid: string, moduleId: string) {
  const docId = sanitizeDocId(`${uid}_${moduleId}_session`);
  const path = `tutorSessions/${docId}`;
  try {
    const snap = await getDoc(doc(db, 'tutorSessions', docId));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export { collection, query, where, onSnapshot, doc };
