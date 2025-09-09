export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  provider: 'apple' | 'google';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AdminPermissions {
  canImportRecipes: boolean;
  canEditAllRecipes: boolean;
  canManageUsers: boolean;
  canDeleteRecipes: boolean;
}