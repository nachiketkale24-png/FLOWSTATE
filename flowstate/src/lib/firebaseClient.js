/**
 * Firebase Client SDK Configuration
 * 
 * Initialize Firebase for client-side authentication and Firestore
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate configuration
const requiredKeys = [
  'apiKey',
  'authDomain',
  'projectId',
];

const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);

let app = null;
let auth = null;
let db = null;

if (missingKeys.length > 0) {
  console.warn('⚠️ Missing Firebase configuration. Running in DEMO MODE.');
  console.warn('Add Firebase credentials to .env file to enable authentication.');
  console.warn('Missing keys:', missingKeys);
  
  // Create demo/mock exports for development
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      // Immediately call callback with null to indicate no user
      setTimeout(() => callback(null), 0);
      return () => {};
    },
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
    signOut: () => Promise.resolve(),
  };
  
  db = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.resolve({ exists: false, data: () => ({}) }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve(),
      }),
    }),
  };
} else {
  // Initialize Firebase
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Connect to emulators in development (optional)
    if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
      console.log('🔧 Connecting to Firebase Emulators...');
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectFirestoreEmulator(db, 'localhost', 8080);
    }

    console.log('✅ Firebase initialized successfully');
    console.log(`📊 Project: ${firebaseConfig.projectId}`);
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
}

export { app, auth, db };
export default app;
