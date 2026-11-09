import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import * as service from '../services/authService';
import { firebaseConfigured } from '../config/firebase';

interface AuthValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  configured: boolean;
  login: typeof service.login;
  signup: typeof service.signup;
  loginWithGoogle: typeof service.loginWithGoogle;
  logout: typeof service.logout;
}
export const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    service
      .initializeAuth()
      .then(() => {
        if (!active) return;
        unsubscribe = service.observeAuth(
          (next) => {
            setUser(next);
            setLoading(false);
          },
          (failure) => {
            setError(service.authErrorMessage(failure));
            setLoading(false);
          },
        );
      })
      .catch((failure: unknown) => {
        if (active) {
          setError(service.authErrorMessage(failure));
          setLoading(false);
        }
      });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        configured: firebaseConfigured,
        login: service.login,
        signup: service.signup,
        loginWithGoogle: service.loginWithGoogle,
        logout: service.logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
