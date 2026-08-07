import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setAuth: (accessToken: string, user: User) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

/**
 * SECURITY NOTE: this store persists to localStorage, so the access token
 * is readable by any JS running on the page (including injected scripts,
 * if the app is ever vulnerable to XSS). Unlike the old single-token setup,
 * this token is short-lived (15 min) by design, and the long-lived refresh
 * token never touches this store or localStorage at all — it lives in an
 * httpOnly cookie the backend sets, which JS cannot read even during an
 * XSS attack. That's the real security boundary now; this store only ever
 * holds the short-lived, lower-value half of the pair.
 */

// what's updated?
// setAccessToken is the new piece — setAuth is only called from a full login (sets both token and user together); the silent-refresh flow in axios.ts only ever needs to swap in a new token without touching user, so it gets its own narrower action.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAuth: (accessToken, user) => set({ accessToken, user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAuth: () => set({ accessToken: null, user: null }),
    }),
    { name: 'auth-storage' }
  )
);

// add near the bottom of src/store/auth.store.ts, alongside useAuthStore
export const resetAuthStore = () => useAuthStore.setState(useAuthStore.getInitialState());
