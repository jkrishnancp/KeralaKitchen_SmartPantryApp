import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '@/types/auth';

export interface AuthService {
  signInWithApple(): Promise<User>;
  signInWithGoogle(): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  isAdmin(user: User): boolean;
}

export class LocalAuthService implements AuthService {
  private readonly STORAGE_KEY = 'kerala_kitchen_user';
  private readonly KEYCHAIN_SERVICE = 'kerala_kitchen_auth';

  async signInWithApple(): Promise<User> {
    // TODO: Implement Apple Sign-In
    // This would use @react-native-apple-authentication/apple-authentication
    // For now, return a mock admin user for development
    const mockUser: User = {
      id: 'apple_admin_123',
      email: 'admin@keralakitchen.com',
      name: 'Admin User',
      role: 'admin',
      provider: 'apple',
      createdAt: new Date().toISOString()
    };

    await this.storeUser(mockUser);
    return mockUser;
  }

  async signInWithGoogle(): Promise<User> {
    // TODO: Implement Google Sign-In
    // This would use @react-native-google-signin/google-signin
    // For now, return a mock user for development
    const mockUser: User = {
      id: 'google_user_456',
      email: 'user@gmail.com',
      name: 'Regular User',
      }
  }

  async signOut(): Promise<void> {
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  isAdmin(user: User): boolean {
    return user.role === 'admin';
  }

  private async storeUser(user: User): Promise<void> {
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    
    // Store sensitive data in Keychain
    await Keychain.setInternetCredentials(
      this.KEYCHAIN_SERVICE,
      user.email,
      user.id
    );
  }
}

export const authService = new LocalAuthService();