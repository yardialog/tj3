import { create } from 'zustand';
import { UserRole, TeenagerProfile, EmployerProfile } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  phone: string | null;
  teenager: TeenagerProfile | null;
  employer: EmployerProfile | null;
  createdAt: string;
  lastLoginAt: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasInitiallyLoaded: boolean;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  hasInitiallyLoaded: false,

  setUser: (user) => set({
    user,
    isAuthenticated: !!user,
    isLoading: false
  }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  },

  refreshToken: async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        return true;
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      return false;
    }
  },

  authenticatedFetch: async (url: string, options: RequestInit = {}) => {
    let response = await fetch(url, {
      ...options,
      credentials: 'include',
    });

    if (response.status === 401) {
      const refreshed = await get().refreshToken();

      if (refreshed) {
        response = await fetch(url, {
          ...options,
          credentials: 'include',
        });
      }
    }

    return response;
  },

  fetchUser: async () => {
    const shouldShowLoading = get().hasInitiallyLoaded;
    if (shouldShowLoading) {
      set({ isLoading: true });
    }

    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          hasInitiallyLoaded: true
        });
      } else {
        // Try to refresh token
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          // Retry fetching user
          const retryResponse = await fetch('/api/auth/me', {
            credentials: 'include',
          });
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
              hasInitiallyLoaded: true
            });
            return;
          }
        }

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          hasInitiallyLoaded: true
        });
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasInitiallyLoaded: true
      });
    }
  },
}));
