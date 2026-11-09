import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

function requireAuth() {
  if (!auth)
    throw new Error(
      'Authentication is not configured. Add your Firebase values to .env.local and restart the app.',
    );
  return auth;
}
let persistence: Promise<void> | undefined;
function prepareAuth() {
  const instance = requireAuth();
  persistence ??= setPersistence(instance, browserLocalPersistence).catch(
    (error) => {
      persistence = undefined;
      throw error;
    },
  );
  return persistence.then(() => instance);
}
export function observeAuth(
  next: (user: User | null) => void,
  error: (error: Error) => void,
) {
  if (!auth) {
    next(null);
    return () => {};
  }
  return onAuthStateChanged(auth, next, error);
}
export async function login(email: string, password: string) {
  return signInWithEmailAndPassword(
    await prepareAuth(),
    email.trim(),
    password,
  );
}
export async function signup(email: string, password: string) {
  return createUserWithEmailAndPassword(
    await prepareAuth(),
    email.trim(),
    password,
  );
}
export function loginWithGoogle() {
  // AuthProvider prepares persistence before enabling the button. Keep the popup
  // in the click event so browsers do not treat it as an unsolicited popup.
  return signInWithPopup(requireAuth(), googleProvider);
}
export async function initializeAuth() {
  if (auth) await prepareAuth();
}
export function logout() {
  return signOut(requireAuth());
}
export function authErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String(error.code)
      : '';
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/user-not-found': 'The email or password is incorrect.',
    'auth/wrong-password': 'The email or password is incorrect.',
    'auth/email-already-in-use':
      'An account already exists with this email. Please sign in.',
    'auth/weak-password': 'Choose a password with at least 6 characters.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/popup-closed-by-user':
      'Google sign-in was cancelled. Please try again.',
    'auth/cancelled-popup-request':
      'Another sign-in window was opened. Please try again.',
    'auth/popup-blocked':
      'Allow popups for this site, then try Google sign-in again.',
    'auth/network-request-failed':
      'Unable to connect. Check your internet connection.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/unauthorized-domain':
      'This domain is not enabled for Firebase authentication.',
    'auth/operation-not-allowed':
      'This sign-in method is not enabled in Firebase.',
  };
  return (
    messages[code] ??
    (error instanceof Error
      ? error.message
      : 'Authentication failed. Please try again.')
  );
}
