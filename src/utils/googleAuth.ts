import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { RoutePath, UserProfile } from '../types/academic';
import {
  checkEmailAuthorization,
  resolveRoleFromEmail,
  RoleResolutionResult,
} from './academicLogic';

export const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

// Initialize Firebase App instance safely (prevent duplicate initialization)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Provider with Google Workspace profile and email scopes
const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to track active sign-in flow
let isSigningIn = false;
// Cache access token in-memory only (never persisted to localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

/**
 * Builds a typed UserProfile from a real authenticated Firebase/Google user.
 */
export function buildUserProfileFromGoogleUser(firebaseUser: User): UserProfile {
  const email = firebaseUser.email || 'estudiante@estudiante.ufm.edu';
  const displayName = firebaseUser.displayName || email.split('@')[0];
  
  // Compute initials
  const nameParts = displayName.trim().split(/\s+/);
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : displayName.slice(0, 2).toUpperCase();

  // If the user's email matches the mock student or is an @estudiante.ufm.edu / @ufm.edu account
  const baseProfile = resolveRoleFromEmail(email).user;

  return {
    ...baseProfile,
    id: firebaseUser.uid,
    name: displayName,
    email: email,
    initials: initials || 'UFM',
    avatarUrl: firebaseUser.photoURL || undefined,
    badgeText: 'Persona Libre y Responsable · Cuenta Google Verificada',
  };
}

/**
 * Initialize Firebase Auth listener.
 * Clears the in-memory access token on sign-out.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, profile: UserProfile, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    if (firebaseUser) {
      const profile = buildUserProfileFromGoogleUser(firebaseUser);
      if (onAuthSuccess) {
        onAuthSuccess(firebaseUser, profile, cachedAccessToken);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) {
        onAuthFailure();
      }
    }
  });
};

export interface GoogleSignInResult {
  firebaseUser: User;
  userProfile: UserProfile;
  accessToken: string;
  resolution: RoleResolutionResult;
}

/**
 * Executes interactive Google Workspace popup authentication.
 */
export const googleSignIn = async (): Promise<GoogleSignInResult> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email || '';

    // Enforce authorization against institutional student roll
    const authCheck = checkEmailAuthorization(email);
    if (!authCheck.isAuthorized) {
      await signOut(auth);
      cachedAccessToken = null;
      const error: any = new Error(authCheck.reason);
      error.code = 'auth/unauthorized-account';
      error.unauthorizedEmail = email;
      throw error;
    }

    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    // Cache the OAuth access token in-memory
    cachedAccessToken = credential?.accessToken || null;

    const userProfile = buildUserProfileFromGoogleUser(result.user);
    const resolution: RoleResolutionResult = {
      role: 'student',
      targetRoute: '/student/dashboard',
      domain: result.user.email?.split('@')[1] || 'ufm.edu',
      claimDescription: 'Google Workspace SSO Verificado · Alumno Autorizado',
      user: userProfile,
    };

    return {
      firebaseUser: result.user,
      userProfile,
      accessToken: cachedAccessToken || '',
      resolution,
    };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Returns currently cached in-memory access token.
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Signs out from Firebase Auth and purges the in-memory token.
 */
export const googleSignOut = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};
