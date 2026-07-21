import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { configureApiClient } from '../services/apiClient';
import { authService } from '../services/authService';
import type { LoginRequest, RegisterRequest, User } from '../types/api';

const SESSION_KEY = 'starlyvia.session.v1';

type StoredSession = {
  token: string;
  user: User;
};

type AuthContextValue = {
  isRestoring: boolean;
  isSubmitting: boolean;
  token: string | null;
  user: User | null;
  signIn: (input: LoginRequest) => Promise<void>;
  register: (input: RegisterRequest) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sessionRef = useRef<StoredSession | null>(null);

  const clearSession = useCallback(async () => {
    sessionRef.current = null;
    setSession(null);
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }, []);

  useEffect(() => {
    configureApiClient({
      getToken: () => sessionRef.current?.token ?? null,
      onUnauthorized: () => {
        void clearSession();
      },
    });
  }, [clearSession]);

  useEffect(() => {
    async function restore() {
      try {
        const stored = await SecureStore.getItemAsync(SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as StoredSession;
          if (parsed.token && parsed.user?.userId) {
            sessionRef.current = parsed;
            setSession(parsed);
          }
        }
      } catch {
        await SecureStore.deleteItemAsync(SESSION_KEY);
      } finally {
        setIsRestoring(false);
      }
    }
    void restore();
  }, []);

  const signIn = useCallback(async (input: LoginRequest) => {
    setIsSubmitting(true);
    try {
      const response = await authService.login(input);
      const { token, ...user } = response;
      const nextSession = { token, user };
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(nextSession));
      sessionRef.current = nextSession;
      setSession(nextSession);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const register = useCallback(
    async (input: RegisterRequest) => {
      setIsSubmitting(true);
      try {
        await authService.register(input);
        const response = await authService.login({ email: input.email, password: input.password });
        const { token, ...user } = response;
        const nextSession = { token, user };
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(nextSession));
        sessionRef.current = nextSession;
        setSession(nextSession);
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isRestoring,
      isSubmitting,
      register,
      signIn,
      signOut: clearSession,
      token: session?.token ?? null,
      user: session?.user ?? null,
    }),
    [clearSession, isRestoring, isSubmitting, register, session, signIn],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
