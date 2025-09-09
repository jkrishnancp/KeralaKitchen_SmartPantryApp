import { create } from 'zustand';
import { User, AuthState } from '@/types/auth';
import { authService } from '@/services/authService';

interface AuthStore extends AuthState {
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  signInWithApple: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.signInWithApple();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Apple Sign-In failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.signInWithGoogle();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await authService.signOut();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error('Sign out failed:', error);
      set({ isLoading: false });
    }
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      set({ 
        user, 
        isAuthenticated: !!user, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Load user failed:', error);
      set({ isLoading: false });
    }
  },

  isAdmin: () => {
    const { user } = get();
    return user ? authService.isAdmin(user) : false;
  }
}));