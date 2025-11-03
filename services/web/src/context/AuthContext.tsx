'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { apiFetch, resolveAssetUrl } from '@/lib/api';

type Subscription = {
  status: string;
  plan: string;
  trialEndsAt?: string | null;
};

type UserRole = 'ADMIN' | 'USER';

type UserProfile = {
  id: number;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  role?: UserRole;
  organization?: {
    id: number;
    name: string;
  } | null;
  trialEndsAt?: string | null;
  subscription?: Subscription | null;
  stats?: {
    customers: number;
    invoices: number;
  };
};

type AuthResponsePayload = {
  token: string;
  user: UserProfile;
  subscription?: Subscription | null;
};

type AuthContextValue = {
  token: string | null;
  user: UserProfile | null;
  subscription: Subscription | null;
  loading: boolean;
  login: (payload: AuthResponsePayload) => Promise<void>;
  logout: () => void;
  refresh: (tokenOverride?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'tmr-token';

async function fetchProfile(token: string): Promise<UserProfile | null> {
  const response = await apiFetch('/api/users/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const profile = (await response.json()) as UserProfile;
  return {
    ...profile,
    avatarUrl: resolveAssetUrl(profile.avatarUrl) ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);
    fetchProfile(storedToken)
      .then((profile) => {
        if (!profile) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken(null);
          setUser(null);
          setSubscription(null);
          return;
        }
        setUser(profile);
        setSubscription(profile.subscription ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async ({ token: newToken, user: userPayload, subscription: subscriptionPayload }: AuthResponsePayload) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setToken(newToken);
    const normalizedUser: UserProfile = {
      ...userPayload,
      avatarUrl: resolveAssetUrl(userPayload.avatarUrl) ?? null,
    };
    setUser({
      ...normalizedUser,
      subscription: subscriptionPayload ?? userPayload.subscription ?? null,
    });
    setSubscription(subscriptionPayload ?? null);
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
    setSubscription(null);
    setLoading(false);
  }, []);

  const refresh = useCallback(async (tokenOverride?: string) => {
    const activeToken = tokenOverride ?? token;
    if (!activeToken) return;
    const profile = await fetchProfile(activeToken);
    if (!profile) {
      logout();
      return;
    }
    setUser(profile);
    setSubscription(profile.subscription ?? null);
  }, [token, logout]);

  const value = useMemo(
    () => ({
      token,
      user,
      subscription,
      loading,
      login,
      logout,
      refresh,
    }),
    [token, user, subscription, loading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
