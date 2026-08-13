import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Firestore targeting custom databaseId if provided
const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export { app, auth, db, firebaseConfig };

export async function getIdToken(): Promise<string | null> {
  if (!auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken();
  } catch (err) {
    console.error('Error fetching Firebase ID Token:', err);
    return null;
  }
}
