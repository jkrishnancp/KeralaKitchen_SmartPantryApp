import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { Search, Filter, Clock, Users, Leaf, Beef } from 'lucide-react-native';
import { Recipe } from '@/types/database';
import { databaseService } from '@/services/database';
import { seedDataService } from '@/data/seedData';
import { router } from 'expo-router';

export default function ExploreScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const categoryImages = {
    all: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    veg: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=400',
    'non-veg': 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400',
    breakfast: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=400',
    curry: 'https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg?auto=compress&cs=tinysrgb&w=400',
  };

  const filters = [
    { key: 'all', label: 'All Recipes', icon: '🍛', color: '#16a34a' },
    { key: 'veg', label: 'Vegetarian', icon: '🥬', color: '#22c55e' },
    { key: 'non-veg', label: 'Non-Veg', icon: '🍖', color: '#ef4444' },
    { key: 'breakfast', label: 'Breakfast', icon: '🌅', color: '#f59e0b' },
    { key: 'curry', label: 'Curries', icon: '🍲', color: '#8b5cf6' },
  ];

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [recipes, searchQuery, selectedFilter]);

  const initializeData = async () => {
    try {
      await seedDataService.initializeDatabase();
      const allRecipes = await databaseService.getAllRecipes();
      setRecipes(allRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    let filtered = recipes;

    if (searchQuery.trim()) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(ing => 
          ing.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(recipe =>
        recipe.tags.includes(selectedFilter)
      );
    }

    setFilteredRecipes(filtered);
  };

  const navigateToRecipe = (recipe: Recipe) => {
    router.push({
      pathname: '/recipe/[id]',
      params: { id: recipe.id }
    });
  };

  const renderCategoryCard = (filter: any) => (
    <TouchableOpacity
      key={filter.key}
      style={[
        styles.categoryCard,
        selectedFilter === filter.key && styles.activeCategoryCard
      ]}
      onPress={() => setSelectedFilter(filter.key)}
    >
      <Image 
        source={{ uri: categoryImages[filter.key] }} 
        style={styles.categoryImage}
        resizeMode="cover"
      />
      <View style={styles.categoryOverlay}>
        <Text style={styles.categoryIcon}>{filter.icon}</Text>
        <Text style={styles.categoryLabel}>{filter.label}</Text>
        <View style={[styles.categoryBadge, { backgroundColor: filter.color }]}>
          <Text style={styles.categoryCount}>
            {recipes.filter(r => filter.key === 'all' || r.tags.includes(filter.key)).length}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRecipeCard = (recipe: Recipe) => (
    <TouchableOpacity
      key={recipe.id}
      style={styles.recipeCard}
      onPress={() => navigateToRecipe(recipe)}
      activeOpacity={0.7}
    >
      <View style={styles.recipeImageContainer}>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300' }}
          style={styles.recipeImage}
          resizeMode="cover"
        />
        <View style={styles.recipeImageOverlay}>
          <Text style={styles.recipeEmoji}>
            {recipe.tags.includes('veg') ? '🥬' : recipe.tags.includes('non-veg') ? '🍖' : '🍛'}
          </Text>
        </View>
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
        
        {recipe.caloriesPerServing && (
          <Text style={styles.calories}>
            {recipe.caloriesPerServing} cal/serving
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading recipes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kerala Kitchen</Text>
        <Text style={styles.headerSubtitle}>Discover authentic flavors</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes or ingredients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Cards */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {filters.map(renderCategoryCard)}
          </ScrollView>
        </View>

        {/* Recipes Grid */}
        <View style={styles.recipesSection}>
          <Text style={styles.sectionTitle}>
            {selectedFilter === 'all' ? 'All Recipes' : filters.find(f => f.key === selectedFilter)?.label} 
            ({filteredRecipes.length})
          </Text>
          
          {filteredRecipes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No recipes found</Text>
              <Text style={styles.emptyText}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            <View style={styles.recipeGrid}>
              {filteredRecipes.map(renderRecipeCard)}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  categoryCard: {
    width: 120,
    height: 100,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeCategoryCard: {
    borderWidth: 3,
    borderColor: '#16a34a',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  recipesSection: {
    paddingHorizontal: 20,
  },
  recipeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recipeCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImageContainer: {
    height: 120,
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  recipeImageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 4,
  },
  recipeEmoji: {
    fontSize: 16,
  },
  recipeContent: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 18,
  },
  recipeTags: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#166534',
  },
  recipeMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 2,
  },
  calories: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});