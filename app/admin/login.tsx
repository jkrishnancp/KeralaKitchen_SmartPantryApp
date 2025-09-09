import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Apple, Chrome } from 'lucide-react-native';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminLoginScreen() {
  const { signInWithApple, signInWithGoogle, isLoading } = useAuthStore();
  const [signingInWith, setSigningInWith] = useState<'apple' | 'google' | null>(null);

  const handleAppleSignIn = async () => {
    try {
      setSigningInWith('apple');
      await signInWithApple();
      router.replace('/admin/dashboard');
    } catch (error) {
      Alert.alert('Sign In Failed', 'Unable to sign in with Apple. Please try again.');
    } finally {
      setSigningInWith(null);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setSigningInWith('google');
      await signInWithGoogle();
      router.replace('/admin/dashboard');
    } catch (error) {
      Alert.alert('Sign In Failed', 'Unable to sign in with Google. Please try again.');
    } finally {
      setSigningInWith(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Login</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.logoSection}>
          <Text style={styles.logoEmoji}>🍛</Text>
          <Text style={styles.logoTitle}>Kerala Kitchen</Text>
          <Text style={styles.logoSubtitle}>Admin Access</Text>
        </View>

        <View style={styles.signInSection}>
          <Text style={styles.signInTitle}>Sign in to continue</Text>
          <Text style={styles.signInSubtitle}>
            Admin access required for recipe management
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.signInButton, styles.appleButton]}
              onPress={handleAppleSignIn}
              disabled={isLoading}
            >
              {signingInWith === 'apple' ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Apple size={20} color="#ffffff" />
              )}
              <Text style={styles.appleButtonText}>
                {signingInWith === 'apple' ? 'Signing in...' : 'Continue with Apple'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signInButton, styles.googleButton]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              {signingInWith === 'google' ? (
                <ActivityIndicator size="small" color="#374151" />
              ) : (
                <Chrome size={20} color="#374151" />
              )}
              <Text style={styles.googleButtonText}>
                {signingInWith === 'google' ? 'Signing in...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Only authorized administrators can access recipe management features.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  logoSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  signInSection: {
    marginBottom: 48,
  },
  signInTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  signInSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 16,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});