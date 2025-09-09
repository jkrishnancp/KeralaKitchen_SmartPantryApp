import { create } from 'zustand';
import { Recipe, FoodItem, RecipeMatchResult } from '@/types/database';

interface AppState {
  // Recipes
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  recipeMatches: RecipeMatchResult[];
  
  // Inventory
  inventory: FoodItem[];
  
  // UI State
  activeTab: string;
  isLoading: boolean;
  
  // Actions
  setRecipes: (recipes: Recipe[]) => void;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  setRecipeMatches: (matches: RecipeMatchResult[]) => void;
  setInventory: (inventory: FoodItem[]) => void;
  addToInventory: (item: FoodItem) => void;
  removeFromInventory: (id: string) => void;
  updateInventoryItem: (id: string, updates: Partial<FoodItem>) => void;
  setActiveTab: (tab: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  recipes: [],
  selectedRecipe: null,
  recipeMatches: [],
  inventory: [],
  activeTab: 'explore',
  isLoading: false,

  // Actions
  setRecipes: (recipes) => set({ recipes }),
  
  setSelectedRecipe: (recipe) => set({ selectedRecipe: recipe }),
  
  setRecipeMatches: (matches) => set({ recipeMatches: matches }),
  
  setInventory: (inventory) => set({ inventory }),
  
  addToInventory: (item) => set((state) => ({
    inventory: [...state.inventory, item]
  })),
  
  removeFromInventory: (id) => set((state) => ({
    inventory: state.inventory.filter(item => item.id !== id)
  })),
  
  updateInventoryItem: (id, updates) => set((state) => ({
    inventory: state.inventory.map(item => 
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    )
  })),
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setLoading: (loading) => set({ isLoading: loading })
}));