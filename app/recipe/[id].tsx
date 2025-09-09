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
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Clock, Users, ChefHat, Heart, CircleCheck as CheckCircle, Circle, Timer, Utensils } from 'lucide-react-native';
import { Recipe, RecipeIngredient } from '@/types/database';
import { databaseService } from '@/services/database';
import { RecipePairingService } from '@/services/pairingService';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [servings, setServings] = useState(4);

  const pairingService = new RecipePairingService();

  useEffect(() => {
    if (id) {
      loadRecipe();
    }
  }, [id]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      const recipeData = await databaseService.getRecipeById(id);
      
      if (recipeData) {
        setRecipe(recipeData);
        setServings(recipeData.servings);
      } else {
        Alert.alert('Error', 'Recipe not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
      Alert.alert('Error', 'Failed to load recipe');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredientCheck = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const scaleIngredient = (ingredient: RecipeIngredient) => {
    if (!recipe || !ingredient.amount) return ingredient;
    
    const scale = servings / recipe.servings;
    return {
      ...ingredient,
      amount: Math.round((ingredient.amount * scale) * 100) / 100
    };
  };

  const getTotalTime = () => {
    if (!recipe) return 0;
    const scale = servings / recipe.servings;
    // Prep time scales linearly, cook time has diminishing returns
    return Math.round(recipe.prepMinutes * scale + recipe.cookMinutes * Math.sqrt(scale));
  };

  const getScaledCalories = () => {
    if (!recipe?.caloriesPerServing) return null;
    return Math.round(recipe.caloriesPerServing * servings);
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    // TODO: Implement actual timer functionality
    Alert.alert('Timer Started', `Timer set for ${getTotalTime()} minutes`);
  };

  const renderIngredient = (ingredient: RecipeIngredient, index: number) => {
    const scaled = scaleIngredient(ingredient);
    const isChecked = checkedIngredients.has(index);

    return (
      <TouchableOpacity
        key={index}
        style={styles.ingredientItem}
        onPress={() => toggleIngredientCheck(index)}
      >
        {isChecked ? (
          <CheckCircle size={20} color="#16a34a" />
        ) : (
          <Circle size={20} color="#d1d5db" />
        )}
        
        <View style={styles.ingredientText}>
          <Text style={[
            styles.ingredientName,
            isChecked && styles.checkedIngredient
          ]}>
            {scaled.name}
          </Text>
          
          {scaled.amount && (
            <Text style={styles.ingredientAmount}>
              {scaled.amount} {scaled.unit}
            </Text>
          )}
          
          {ingredient.optional && (
            <Text style={styles.optionalText}>(optional)</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderStep = (step: string, index: number) => {
    const isCurrentStep = index === currentStep;
    const isCompleted = index < currentStep;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.stepItem,
          isCurrentStep && styles.currentStep,
          isCompleted && styles.completedStep
        ]}
        onPress={() => setCurrentStep(index)}
      >
        <View style={[
          styles.stepNumber,
          isCurrentStep && styles.currentStepNumber,
          isCompleted && styles.completedStepNumber
        ]}>
          <Text style={[
            styles.stepNumberText,
            (isCurrentStep || isCompleted) && styles.activeStepText
          ]}>
            {index + 1}
          </Text>
        </View>
        
        <Text style={[
          styles.stepText,
          isCompleted && styles.completedStepText
        ]}>
          {step}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading || !recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading recipe...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.favoriteButton}>
          <Heart size={24} color="#d1d5db" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Recipe Header */}
        <View style={styles.recipeHeader}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          
          <View style={styles.recipeTags}>
            {recipe.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recipe Stats */}
        <View style={styles.recipeStats}>
          <View style={styles.statItem}>
            <Clock size={20} color="#6b7280" />
            <Text style={styles.statText}>{getTotalTime()} min</Text>
          </View>
          
          <View style={styles.statItem}>
            <Users size={20} color="#6b7280" />
            <Text style={styles.statText}>{servings} servings</Text>
          </View>
          
          <View style={styles.statItem}>
            <ChefHat size={20} color="#6b7280" />
            <Text style={styles.statText}>{recipe.region}</Text>
          </View>
          
          {getScaledCalories() && (
            <View style={styles.statItem}>
              <Text style={styles.caloriesText}>{getScaledCalories()} cal</Text>
            </View>
          )}
        </View>

        {/* Servings Adjuster */}
        <View style={styles.servingsSection}>
          <Text style={styles.sectionTitle}>Servings</Text>
          <View style={styles.servingsControls}>
            <TouchableOpacity
              style={styles.servingsButton}
              onPress={() => servings > 1 && setServings(servings - 1)}
              disabled={servings <= 1}
            >
              <Text style={styles.servingsButtonText}>-</Text>
            </TouchableOpacity>
            
            <Text style={styles.servingsCount}>{servings}</Text>
            
            <TouchableOpacity
              style={styles.servingsButton}
              onPress={() => setServings(servings + 1)}
            >
              <Text style={styles.servingsButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Ingredients ({checkedIngredients.size}/{recipe.ingredients.length})
          </Text>
          
          <View style={styles.ingredientsList}>
            {recipe.ingredients.map(renderIngredient)}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <View style={styles.instructionsHeader}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            
            <TouchableOpacity
              style={styles.timerButton}
              onPress={startTimer}
              disabled={isTimerRunning}
            >
              <Timer size={16} color="#ffffff" />
              <Text style={styles.timerButtonText}>
                {isTimerRunning ? 'Running' : 'Start Timer'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.stepsList}>
            {recipe.steps.map(renderStep)}
          </View>
          
          <View style={styles.stepControls}>
            <TouchableOpacity
              style={[
                styles.stepControl,
                currentStep === 0 && styles.disabledControl
              ]}
              onPress={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <Text style={styles.stepControlText}>Previous</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.stepControl,
                currentStep === recipe.steps.length - 1 && styles.disabledControl
              ]}
              onPress={() => setCurrentStep(Math.min(recipe.steps.length - 1, currentStep + 1))}
              disabled={currentStep === recipe.steps.length - 1}
            >
              <Text style={styles.stepControlText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes */}
        {recipe.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chef's Notes</Text>
            <Text style={styles.notesText}>{recipe.notes}</Text>
          </View>
        )}

        {/* Pairing Suggestions */}
        {(recipe.compatibleMains.length > 0 || recipe.compatibleCurries.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pairs Well With</Text>
            
            {recipe.compatibleMains.length > 0 && (
              <View style={styles.pairingGroup}>
                <Text style={styles.pairingTitle}>Mains:</Text>
                <View style={styles.pairingTags}>
                  {recipe.compatibleMains.map((main) => (
                    <View key={main} style={styles.pairingTag}>
                      <Text style={styles.pairingTagText}>{main}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {recipe.compatibleCurries.length > 0 && (
              <View style={styles.pairingGroup}>
                <Text style={styles.pairingTitle}>Curries:</Text>
                <View style={styles.pairingTags}>
                  {recipe.compatibleCurries.map((curry) => (
                    <View key={curry} style={styles.pairingTag}>
                      <Text style={styles.pairingTagText}>{curry}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Cooking Mode Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cookingModeButton}
          onPress={() => {
            // TODO: Implement cooking mode
            Alert.alert('Cooking Mode', 'Full screen cooking mode coming soon!');
          }}
        >
          <Utensils size={20} color="#ffffff" />
          <Text style={styles.cookingModeText}>Start Cooking</Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  favoriteButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  recipeHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 32,
    marginBottom: 12,
  },
  recipeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#166534',
  },
  recipeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  caloriesText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '500',
  },
  servingsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  servingsControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingsButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  servingsCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  ingredientsList: {
    gap: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ingredientText: {
    marginLeft: 12,
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 2,
  },
  checkedIngredient: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  ingredientAmount: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '500',
  },
  optionalText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  instructionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currentStep: {
    backgroundColor: '#f0f9ff',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
  },
  completedStep: {
    opacity: 0.6,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currentStepNumber: {
    backgroundColor: '#16a34a',
  },
  completedStepNumber: {
    backgroundColor: '#dcfce7',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeStepText: {
    color: '#ffffff',
  },
  stepText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    flex: 1,
  },
  completedStepText: {
    textDecorationLine: 'line-through',
  },
  stepControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  stepControl: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  disabledControl: {
    opacity: 0.5,
  },
  stepControlText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  notesText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  pairingGroup: {
    marginBottom: 16,
  },
  pairingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pairingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pairingTag: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  pairingTagText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cookingModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
  },
  cookingModeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});