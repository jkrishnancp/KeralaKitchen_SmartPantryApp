import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Heart, BookmarkPlus, Clock, Users } from 'lucide-react-native';

export default function SavedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Recipes</Text>
        <Text style={styles.headerSubtitle}>
          Your favorite recipes and meal plans
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.emptyState}>
          <Heart size={48} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No saved recipes yet</Text>
          <Text style={styles.emptyText}>
            Save your favorite recipes by tapping the heart icon when viewing a recipe
          </Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <BookmarkPlus size={20} color="#16a34a" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Save Favorites</Text>
                <Text style={styles.featureDescription}>
                  Bookmark recipes you love for quick access
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Clock size={20} color="#16a34a" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Meal Planning</Text>
                <Text style={styles.featureDescription}>
                  Plan your meals for the week ahead
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Users size={20} color="#16a34a" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Family Favorites</Text>
                <Text style={styles.featureDescription}>
                  Keep track of recipes your family enjoys
                </Text>
              </View>
            </View>
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  featuresList: {
    width: '100%',
    maxWidth: 320,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureText: {
    marginLeft: 12,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});