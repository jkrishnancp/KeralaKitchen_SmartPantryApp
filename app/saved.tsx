import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ArrowLeft, Heart, Clock, Users, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { Recipe } from '@/types/database';

export default function SavedRecipesScreen() {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  // Mock saved recipes for now
  useEffect(() => {
    // TODO: Load actual saved recipes from database
    setSavedRecipes([]);
  }, []);

  const navigateToRecipe = (recipe: Recipe) => {
    router.push({
      pathname: '/recipe/[id]',
      params: { id: recipe.id }
    });
  };

  const removeSavedRecipe = (recipeId: string) => {
    // TODO: Remove from saved recipes
    setSavedRecipes(prev => prev.filter(r => r.id !== recipeId));
  };

  const renderSavedRecipe = (recipe: Recipe) => (
    <TouchableOpacity
      key={recipe.id}
      style={styles.recipeCard}
      onPress={() => navigateToRecipe(recipe)}
    >
      <View style={styles.recipeImagePlaceholder}>
        <Text style={styles.recipeEmoji}>
          {recipe.tags.includes('veg') ? '🥬' : recipe.tags.includes('non-veg') ? '🍖' : '🍛'}
        </Text>
      </View>
      
      <View style={styles.recipeContent}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {recipe.title}
        </Text>
        
        <View style={styles.recipeTags}>
          {recipe.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.recipeMetrics}>
          <View style={styles.metric}>
            <Clock size={14} color="#6b7280" />
            <Text style={styles.metricText}>
              {recipe.prepMinutes + recipe.cookMinutes} min
            </Text>
          </View>
          
          <View style={styles.metric}>
            <Users size={14} color="#6b7280" />
            <Text style={styles.metricText}>
              {recipe.servings} servings
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeSavedRecipe(recipe.id)}
      >
        <Trash2 size={16} color="#dc2626" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
        
        <Text style={styles.headerTitle}>Saved Recipes</Text>
        
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {savedRecipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Heart size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No saved recipes yet</Text>
            <Text style={styles.emptyText}>
              Save your favorite recipes by tapping the heart icon when viewing a recipe
            </Text>
            
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)/')}
            >
              <Text style={styles.exploreButtonText}>Explore Recipes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.recipesList}>
            {savedRecipes.map(renderSavedRecipe)}
          </View>
        )}
      </ScrollView>
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
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
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
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  recipesList: {
    gap: 16,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeEmoji: {
    fontSize: 24,
  },
  recipeContent: {
    flex: 1,
    padding: 16,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 20,
  },
  recipeTags: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#166534',
  },
  recipeMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  removeButton: {
    padding: 16,
    justifyContent: 'center',
  },
});