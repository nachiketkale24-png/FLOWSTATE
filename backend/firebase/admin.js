/**
 * Firebase Admin SDK Initialization
 * 
 * Setup:
 * 1. Go to Firebase Console → Project Settings → Service Accounts
 * 2. Generate new private key (downloads JSON file)
 * 3. Save as serviceAccount.json in backend/firebase/ folder
 * 4. Add serviceAccount.json to .gitignore
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;

/**
 * Initialize Firebase Admin SDK
 */
export function initializeFirebase() {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      console.log('✅ Firebase Admin already initialized');
      db = admin.firestore();
      return db;
    }

    // Load service account from JSON file
    const serviceAccountPath = join(__dirname, 'serviceAccount.json');
    let serviceAccount;

    try {
      const serviceAccountData = readFileSync(serviceAccountPath, 'utf8');
      serviceAccount = JSON.parse(serviceAccountData);
    } catch (error) {
      console.error('❌ Failed to load serviceAccount.json');
      console.error('📝 Please add your Firebase service account JSON file to:');
      console.error(`   ${serviceAccountPath}`);
      console.error('\n📚 Instructions:');
      console.error('   1. Go to Firebase Console → Project Settings → Service Accounts');
      console.error('   2. Click "Generate New Private Key"');
      console.error('   3. Save the downloaded file as serviceAccount.json in backend/firebase/');
      throw new Error('Firebase service account not found');
    }

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Optional: add your database URL if using Realtime Database
      // databaseURL: "https://your-project.firebaseio.com"
    });

    db = admin.firestore();

    // Configure Firestore settings for better performance
    db.settings({
      ignoreUndefinedProperties: true,
    });

    console.log('✅ Firebase Admin initialized successfully');
    console.log(`📊 Project: ${serviceAccount.project_id}`);
    
    return db;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    throw error;
  }
}

/**
 * Get Firestore database instance
 */
export function getDb() {
  if (!db) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return db;
}

/**
 * Get Firebase Admin instance
 */
export function getAdmin() {
  return admin;
}

// Export initialized db (will be set after initializeFirebase is called)
export { db };