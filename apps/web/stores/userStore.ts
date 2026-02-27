import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@xamle/types';
import { setAccessToken, clearAccessToken } from '@/lib/api';

interface UserState {
  user: User | null;
  accessToken: string | null;
  expiresAt: number | null;

  setUser: (user: User, token: string, expiresIn: number) => void;
  clearUser: () => void;
  isAuthenticated: () => boolean;
  isTokenExpired: () => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      expiresAt: null,

      setUser: (user, token, expiresIn) => {
        console.log('[STORE] Setting user:', { email: user.email, role: user.role, expiresIn });
        setAccessToken(token);
        
        // Set cookies for middleware-based route protection
        const maxAge = expiresIn;
        const cookieOptions = `path=/; max-age=${maxAge}; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`;
        document.cookie = `access_token=${token}; ${cookieOptions}`;
        document.cookie = `user_role=${user.role}; ${cookieOptions}`;
        
        console.log('[STORE] Cookies set:', {
          access_token: document.cookie.includes('access_token'),
          user_role: document.cookie.includes('user_role'),
        });
        
        set({ user, accessToken: token, expiresAt: Date.now() + expiresIn * 1000 });
      },

      clearUser: () => {
        clearAccessToken();
        // Clear auth cookies
        document.cookie = 'access_token=; path=/; max-age=0';
        document.cookie = 'user_role=; path=/; max-age=0';
        set({ user: null, accessToken: null, expiresAt: null });
      },

      isAuthenticated: () => {
        const { user, expiresAt } = get();
        return !!user && (expiresAt ? Date.now() < expiresAt : false);
      },

      isTokenExpired: () => {
        const { expiresAt } = get();
        return expiresAt ? Date.now() >= expiresAt : true;
      },
    }),
    {
      name: 'xamle-user',
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        // Restore the in-memory access token after page refresh
        if (state?.accessToken && state.expiresAt && Date.now() < state.expiresAt) {
          setAccessToken(state.accessToken);
        } else if (state) {
          // Token expired — clear state
          state.accessToken = null;
          state.user = null;
          state.expiresAt = null;
          clearAccessToken();
        }
      },
    },
  ),
);
