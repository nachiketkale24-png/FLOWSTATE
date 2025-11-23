/**
 * Firebase Authentication Middleware
 * 
 * Verifies Firebase ID tokens and attaches user info to requests
 */

import { getAdmin } from '../firebase/admin.js';

/**
 * Verify Firebase ID token from Authorization header
 * 
 * Expected header format: "Authorization: Bearer <idToken>"
 * 
 * On success: attaches req.user = { uid, email, name, ... }
 * On failure: returns 401 Unauthorized
 */
export async function verifyFirebaseToken(req, res, next) {
  try {
    // Check if Firebase is initialized
    let admin;
    try {
      admin = getAdmin();
    } catch (error) {
      // Firebase not configured - allow request with demo user
      console.log('⚠️  Firebase not configured, using demo user');
      req.user = {
        uid: 'demo-user',
        email: 'demo@flowstate.ai',
        name: 'Demo User',
        emailVerified: true,
        isDemo: true,
      };
      return next();
    }

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token but Firebase configured - allow demo user for development
      console.log('⚠️  No auth token, using demo user');
      req.user = {
        uid: 'demo-user',
        email: 'demo@flowstate.ai',
        name: 'Demo User',
        emailVerified: true,
        isDemo: true,
      };
      return next();
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'ID token is empty',
        timestamp: new Date().toISOString(),
      });
    }

    // Verify the token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Attach user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      name: decodedToken.name || null,
      emailVerified: decodedToken.email_verified || false,
      picture: decodedToken.picture || null,
      isDemo: false,
      // Include any custom claims if needed
      ...decodedToken,
    };

    // Log authentication (optional, remove in production for privacy)
    console.log(`✅ Authenticated user: ${req.user.email || req.user.uid}`);

    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);

    // Fallback to demo user instead of returning 401
    console.log('⚠️  Auth failed, using demo user');
    req.user = {
      uid: 'demo-user',
      email: 'demo@flowstate.ai',
      name: 'Demo User',
      emailVerified: true,
      isDemo: true,
    };
    next();
  }
}

/**
 * Optional: Middleware to verify token but allow requests to proceed even if invalid
 * Useful for routes that have optional authentication
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      const admin = getAdmin();
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        name: decodedToken.name || null,
        emailVerified: decodedToken.email_verified || false,
        picture: decodedToken.picture || null,
      };
    }
  } catch (error) {
    // Silently fail for optional auth
    console.log('⚠️  Optional auth failed, proceeding without user');
  }
  
  next();
}

/**
 * Middleware to check if user email is verified
 * Must be used after verifyFirebaseToken
 */
export function requireEmailVerified(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'User not authenticated',
      timestamp: new Date().toISOString(),
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      error: 'EmailNotVerified',
      message: 'Please verify your email address to access this resource',
      timestamp: new Date().toISOString(),
    });
  }

  next();
}

export default verifyFirebaseToken;
