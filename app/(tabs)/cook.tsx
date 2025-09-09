import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { ChefHat, Clock, Users, Lightbulb, ShoppingCart, Heart, Plus, Settings } from 'lucide-react-native';
import { Recipe, FoodItem, RecipeMatchResult } from '@/types/database';
import { databaseService } from '@/services/database';
import { RecipeMatchingService } from '@/services/recipeMatchingService';
import { RecipePairingService, PairingSuggestion } from '@/services/pairingService';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

export default function CookScreen() {
  const { user, isAdmin } = useAuthStore();
  const [inventory, setInventory] = useState<FoodItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [cookNowRecipes, setCookNowRecipes] = useState<RecipeMatchResult[]>([]);
  const [nearMatchRecipes, setNearMatchRecipes] = useState<RecipeMatchResult[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [pairingSuggestions, setPairingSuggestions] = useState<PairingSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const matchingService = new RecipeMatchingService();
  const pairingService = new RecipePairingService();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allRecipes, inventoryItems] = await Promise.all([
        databaseService.getAllRecipes(),
        databaseService.getAllFoodItems()
      ]);

      setRecipes(allRecipes);
      setInventory(inventoryItems);

      const matches = matchingService.matchRecipesToInventory(allRecipes, inventoryItems);
      
      const cookNow = matchingService.getCookNowRecipes(matches);
      const nearMatch = matchingService.getNearMatchRecipes(matches);

      setCookNowRecipes(cookNow);
      setNearMatchRecipes(nearMatch);

    } catch (error) {
      console.error('Error loading cook data:', error);
      Alert.alert('Error', 'Failed to load cooking suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    
    const suggestions = pairingService.suggestPairingsForMain(recipe, recipes);
    setPairingSuggestions(suggestions);
  };

  const navigateToRecipe = (recipe: Recipe) => {
    router.push({
      pathname: '/recipe/[id]',
      params: { id: recipe.id }
    });
  };

  const navigateToSaved = () => {
    router.push('/saved');
  };

  const navigateToAdmin = () => {
    if (user && isAdmin()) {
      router.push('/admin/dashboard');
    } else {
      router.push('/admin/login');
    }
  };

  const addIngredients = () => {
    Alert.prompt(
      'Add Ingredient',
      'Enter ingredient name:',
      async (name: string) => {
        if (name && name.trim()) {
          try {
            await databaseService.addFoodItem({
              name: name.trim(),
              category: 'Other',
              source: 'manual',
              quantity: 1
            });
            loadData();
          } catch (error) {
            Alert.alert('Error', 'Failed to add ingredient');
          }
        }
      }
    );
  };

  const generateShoppingList = (missingItems: string[]) => {
    const shoppingList = matchingService.generateShoppingList(missingItems);
    
    Alert.alert(
      'Shopping List',
      shoppingList.map(item => `• ${item.item}`).join('\n'),
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save List', onPress: () => {
          console.log('Save shopping list:', shoppingList);
        }}
      ]
    );
  };

  const renderRecipeMatch = (match: RecipeMatchResult, showMissing: boolean = false) => (
    <TouchableOpacity
      key={match.recipe.id}
      style={styles.recipeMatchCard}
      onPress={() => navigateToRecipe(match.recipe)}
    >
      <View style={styles.matchHeader}>
        <Text style={styles.matchTitle} numberOfLines={2}>
          {match.recipe.title}
        </Text>
        
        <View style={[
          styles.matchScore,
          match.score === 1.0 ? styles.perfectMatch : styles.nearMatch
        ]}>
          <Text style={styles.matchScoreText}>
            {Math.round(match.score * 100)}%
          </Text>
        </View>
      </View>

      <View style={styles.recipeInfo}>
        <View style={styles.infoItem}>
          <Clock size={16} color="#6b7280" />
          <Text style={styles.infoText}>
            {match.recipe.prepMinutes + match.recipe.cookMinutes} min
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Users size={16} color="#6b7280" />
          <Text style={styles.infoText}>
            {match.recipe.servings} servings
          </Text>
        </View>
        
        {match.recipe.caloriesPerServing && (
          <View style={styles.infoItem}>
            <Text style={styles.caloriesText}>
              {match.recipe.caloriesPerServing} cal
            </Text>
          </View>
        )}
      </View>

      {showMissing && match.missingItems.length > 0 && (
        <View style={styles.missingSection}>
          <Text style={styles.missingTitle}>
            Missing {match.missingItems.length} item{match.missingItems.length > 1 ? 's' : ''}:
          </Text>
          <Text style={styles.missingItems} numberOfLines={2}>
            {match.missingItems.join(', ')}
          </Text>
          
          <TouchableOpacity
            style={styles.shoppingButton}
            onPress={() => generateShoppingList(match.missingItems)}
          >
            <ShoppingCart size={14} color="#16a34a" />
            <Text style={styles.shoppingButtonText}>Shopping List</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderPairingSuggestion = (suggestion: PairingSuggestion) => (
    <TouchableOpacity
      key={suggestion.recipe.id}
      style={styles.pairingCard}
      onPress={() => navigateToRecipe(suggestion.recipe)}
    >
      <Text style={styles.pairingTitle}>{suggestion.recipe.title}</Text>
      <Text style={styles.pairingReason}>{suggestion.reason}</Text>
      
      <View style={styles.pairingScore}>
        <Text style={styles.pairingScoreText}>
          {Math.round(suggestion.pairingScore * 100)}% match
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Finding recipes you can cook...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>What to Cook?</Text>
          <Text style={styles.headerSubtitle}>
            Based on your pantry ({inventory.length} items)
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={navigateToSaved}>
            <Heart size={20} color="#16a34a" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton} onPress={navigateToAdmin}>
            <Settings size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Cook Now Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ChefHat size={24} color="#16a34a" />
            <Text style={styles.sectionTitle}>Cook Now</Text>
            <Text style={styles.sectionBadge}>{cookNowRecipes.length}</Text>
          </View>
          
          {cookNowRecipes.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyTitle}>No perfect matches</Text>
              <Text style={styles.emptyText}>
                Add more recipes or ingredients to see what you can cook right now
              </Text>
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/admin/import-recipes')}
              >
                <Plus size={16} color="#ffffff" />
                <Text style={styles.addButtonText}>Add Recipe</Text>
              </TouchableOpacity>
            </View>
          ) : (
            cookNowRecipes.map(match => renderRecipeMatch(match))
          )}
        </View>

        {/* Near Match Section */}
        {nearMatchRecipes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Lightbulb size={24} color="#f59e0b" />
              <Text style={styles.sectionTitle}>Almost Ready</Text>
              <Text style={styles.sectionBadge}>{nearMatchRecipes.length}</Text>
            </View>
            
            {nearMatchRecipes.map(match => renderRecipeMatch(match, true))}
          </View>
        )}

        {/* Pairing Suggestions */}
        {pairingSuggestions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Perfect with {selectedRecipe?.title}
              </Text>
            </View>
            
            {pairingSuggestions.map(renderPairingSuggestion)}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/admin/import-recipes')}
          >
            <Text style={styles.actionButtonText}>+ Add Recipe</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => router.push('/(tabs)/inventory')}
          >
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Manage Pantry
            </Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
  sectionBadge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  emptySection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
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
    lineHeight: 20,
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  recipeMatchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  matchScore: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  perfectMatch: {
    backgroundColor: '#dcfce7',
  },
  nearMatch: {
    backgroundColor: '#fef3c7',
  },
  matchScoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  recipeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  caloriesText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  missingSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  missingTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
  },
  missingItems: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  shoppingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  shoppingButtonText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
    marginLeft: 4,
  },
  pairingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  pairingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  pairingReason: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  pairingScore: {
    alignSelf: 'flex-start',
  },
  pairingScoreText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButtonText: {
    color: '#374151',
  },
});