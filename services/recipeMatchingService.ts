import { Recipe, FoodItem, RecipeMatchResult } from '@/types/database';

export class RecipeMatchingService {
  private substitutions: Record<string, string[]> = {
    'onion': ['shallots', 'red onion', 'white onion'],
    'shallots': ['onion', 'small onion'],
    'coconut oil': ['vegetable oil', 'sunflower oil'], // with warning
    'green chili': ['serrano pepper', 'jalapeño'],
    'curry leaves': ['bay leaves'], // with warning
    'ginger': ['ginger paste', 'dry ginger'],
    'garlic': ['garlic paste', 'garlic powder'],
    'tomato': ['canned tomato', 'tomato puree'],
    'coconut': ['coconut milk', 'desiccated coconut'],
    'mustard seeds': ['mustard oil', 'mustard powder'],
    'coriander seeds': ['coriander powder'],
    'cumin seeds': ['cumin powder']
  };

  matchRecipesToInventory(recipes: Recipe[], inventory: FoodItem[]): RecipeMatchResult[] {
    const results: RecipeMatchResult[] = [];
    
    // Create inventory lookup map
    const inventoryMap = new Map<string, FoodItem>();
    inventory.forEach(item => {
      inventoryMap.set(item.name.toLowerCase(), item);
    });

    for (const recipe of recipes) {
      const matchResult = this.calculateRecipeMatch(recipe, inventoryMap);
      results.push(matchResult);
    }

    // Sort by match score descending
    return results.sort((a, b) => b.score - a.score);
  }

  private calculateRecipeMatch(recipe: Recipe, inventoryMap: Map<string, FoodItem>): RecipeMatchResult {
    const requiredIngredients = recipe.ingredients.filter(ing => !ing.optional);
    const availableItems: string[] = [];
    const missingItems: string[] = [];
    
    for (const ingredient of requiredIngredients) {
      const ingredientName = ingredient.name.toLowerCase();
      
      if (this.hasIngredientInInventory(ingredientName, inventoryMap)) {
        availableItems.push(ingredient.name);
      } else if (this.hasSubstituteInInventory(ingredientName, inventoryMap)) {
        availableItems.push(ingredient.name);
      } else {
        missingItems.push(ingredient.name);
      }
    }
    
    const score = requiredIngredients.length > 0 
      ? availableItems.length / requiredIngredients.length 
      : 0;

    return {
      recipe,
      score,
      availableItems,
      missingItems
    };
  }

  private hasIngredientInInventory(ingredientName: string, inventoryMap: Map<string, FoodItem>): boolean {
    const item = inventoryMap.get(ingredientName);
    return item !== undefined && (item.quantity === undefined || item.quantity > 0);
  }

  private hasSubstituteInInventory(ingredientName: string, inventoryMap: Map<string, FoodItem>): boolean {
    const substitutes = this.substitutions[ingredientName] || [];
    
    return substitutes.some(substitute => 
      this.hasIngredientInInventory(substitute.toLowerCase(), inventoryMap)
    );
  }

  getSubstituteSuggestions(ingredient: string): string[] {
    return this.substitutions[ingredient.toLowerCase()] || [];
  }

  getCookNowRecipes(matchResults: RecipeMatchResult[]): RecipeMatchResult[] {
    return matchResults.filter(result => result.score === 1.0);
  }

  getNearMatchRecipes(matchResults: RecipeMatchResult[], threshold = 0.7): RecipeMatchResult[] {
    return matchResults.filter(result => result.score >= threshold && result.score < 1.0);
  }

  generateShoppingList(missingItems: string[]): { item: string; category: string }[] {
    const categoryMap: Record<string, string> = {
      'rice': 'Staple',
      'coconut oil': 'Oil',
      'onion': 'Vegetable',
      'tomato': 'Vegetable',
      'ginger': 'Spice',
      'garlic': 'Spice',
      'curry leaves': 'Spice',
      'mustard seeds': 'Spice',
      'turmeric powder': 'Spice',
      'red chili powder': 'Spice',
      'chicken': 'Protein',
      'fish': 'Protein',
      'milk': 'Dairy',
      'eggs': 'Protein'
    };

    return missingItems.map(item => ({
      item,
      category: categoryMap[item.toLowerCase()] || 'Other'
    }));
  }
}