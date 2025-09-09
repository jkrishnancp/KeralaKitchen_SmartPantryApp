import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { seedDataService } from '@/data/seedData';
import { useAuthStore } from '@/store/useAuthStore';

export default function RootLayout() {
  useFrameworkReady();
  const { loadUser } = useAuthStore();

  useEffect(() => {
    // Initialize database and seed data on app start
    seedDataService.initializeDatabase();
    
    // Load user authentication state
    loadUser();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recipe/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="admin/login" options={{ headerShown: false }} />
        <Stack.Screen name="admin/dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="admin/import-recipes" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}