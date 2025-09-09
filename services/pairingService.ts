import { Recipe } from '@/types/database';

export interface PairingSuggestion {
  recipe: Recipe;
  pairingScore: number;
  reason: string;
}

export class RecipePairingService {
  // Kerala cuisine pairing rules
  private pairingRules = {
    mains: {
      'appam': {
        curries: ['vegetable stew', 'fish curry', 'chicken curry', 'egg roast'],
        sides: ['coconut chutney'],
        score: { 'vegetable stew': 1.0, 'fish curry': 0.9, 'chicken curry': 0.8 }
      },
      'puttu': {
        curries: ['kadala curry', 'fish curry', 'vegetable stew', 'banana'],
        sides: ['coconut chutney', 'sugar and banana'],
        score: { 'kadala curry': 1.0, 'fish curry': 0.8, 'banana': 0.7 }
      },
      'idiyappam': {
        curries: ['vegetable stew', 'fish curry', 'coconut milk'],
        sides: ['coconut chutney', 'sugar'],
        score: { 'vegetable stew': 1.0, 'fish curry': 0.8 }
      },
      'rice': {
        curries: ['sambar', 'rasam', 'fish curry', 'chicken curry', 'dal', 'thoran'],
        sides: ['pickle', 'papadam', 'yogurt'],
        score: { 'sambar': 1.0, 'rasam': 1.0, 'fish curry': 0.9 }
      },
      'porotta': {
        curries: ['chicken curry', 'beef curry', 'fish curry', 'egg roast'],
        sides: ['pickle', 'raita'],
        score: { 'chicken curry': 1.0, 'beef curry': 0.9, 'fish curry': 0.8 }
      },
      'dosa': {
        curries: ['sambar', 'vegetable curry'],
        sides: ['coconut chutney', 'tomato chutney'],
        score: { 'sambar': 1.0, 'coconut chutney': 1.0 }
      }
    },
    curries: {
      'fish curry': {
        mains: ['rice', 'appam', 'puttu', 'porotta'],
        score: { 'rice': 1.0, 'appam': 0.9, 'puttu': 0.8 }
      },
      'chicken curry': {
        mains: ['rice', 'porotta', 'appam'],
        score: { 'rice': 1.0, 'porotta': 1.0, 'appam': 0.8 }
      },
      'vegetable stew': {
        mains: ['appam', 'idiyappam', 'puttu'],
        score: { 'appam': 1.0, 'idiyappam': 1.0, 'puttu': 0.7 }
      },
      'kadala curry': {
        mains: ['puttu', 'appam', 'rice'],
        score: { 'puttu': 1.0, 'appam': 0.8, 'rice': 0.7 }
      },
      'sambar': {
        mains: ['rice', 'dosa', 'idli'],
        score: { 'rice': 1.0, 'dosa': 1.0 }
      },
      'rasam': {
        mains: ['rice'],
        score: { 'rice': 1.0 }
      }
    }
  };

  suggestPairingsForMain(mainRecipe: Recipe, availableRecipes: Recipe[]): PairingSuggestion[] {
    const mainName = this.normalizeRecipeName(mainRecipe.title);
    const pairingInfo = this.pairingRules.mains[mainName];
    
    if (!pairingInfo) return [];

    const suggestions: PairingSuggestion[] = [];

    for (const recipe of availableRecipes) {
      const recipeName = this.normalizeRecipeName(recipe.title);
      
      if (pairingInfo.curries.includes(recipeName)) {
        const score = pairingInfo.score[recipeName] || 0.5;
        suggestions.push({
          recipe,
          pairingScore: score,
          reason: `Traditional pairing with ${mainRecipe.title}`
        });
      }
    }

    return suggestions.sort((a, b) => b.pairingScore - a.pairingScore);
  }

  suggestPairingsForCurry(curryRecipe: Recipe, availableRecipes: Recipe[]): PairingSuggestion[] {
    const curryName = this.normalizeRecipeName(curryRecipe.title);
    const pairingInfo = this.pairingRules.curries[curryName];
    
    if (!pairingInfo) return [];

    const suggestions: PairingSuggestion[] = [];

    for (const recipe of availableRecipes) {
      const recipeName = this.normalizeRecipeName(recipe.title);
      
      if (pairingInfo.mains.includes(recipeName)) {
        const score = pairingInfo.score[recipeName] || 0.5;
        suggestions.push({
          recipe,
          pairingScore: score,
          reason: `Perfect match for ${curryRecipe.title}`
        });
      }
    }

    return suggestions.sort((a, b) => b.pairingScore - a.pairingScore);
  }

  suggestCompleteMeal(selectedRecipe: Recipe, availableRecipes: Recipe[]): {
    main?: Recipe;
    curry?: Recipe;
    side?: Recipe;
    suggestions: PairingSuggestion[];
  } {
    const recipeName = this.normalizeRecipeName(selectedRecipe.title);
    let suggestions: PairingSuggestion[] = [];
    
    if (this.isMainDish(selectedRecipe)) {
      suggestions = this.suggestPairingsForMain(selectedRecipe, availableRecipes);
      return {
        main: selectedRecipe,
        suggestions
      };
    } else if (this.isCurry(selectedRecipe)) {
      suggestions = this.suggestPairingsForCurry(selectedRecipe, availableRecipes);
      return {
        curry: selectedRecipe,
        suggestions
      };
    }

    return { suggestions: [] };
  }

  private normalizeRecipeName(title: string): string {
    const normalized = title.toLowerCase()
      .replace(/\s+(curry|stew|roast)\s*$/, ' $1')
      .replace(/kerala\s+/, '')
      .replace(/traditional\s+/, '')
      .trim();
    
    // Map common variations
    const variations: Record<string, string> = {
      'matta rice': 'rice',
      'basmati rice': 'rice',
      'steamed rice': 'rice',
      'coconut rice': 'rice',
      'meen curry': 'fish curry',
      'kozhi curry': 'chicken curry',
      'vegetable curry': 'vegetable stew',
      'mixed vegetable curry': 'vegetable stew',
      'black chickpea curry': 'kadala curry',
      'chickpea curry': 'kadala curry'
    };

    return variations[normalized] || normalized;
  }

  private isMainDish(recipe: Recipe): boolean {
    const mainKeywords = ['appam', 'puttu', 'idiyappam', 'rice', 'porotta', 'dosa', 'idli', 'bread'];
    const title = recipe.title.toLowerCase();
    
    return mainKeywords.some(keyword => title.includes(keyword)) ||
           recipe.compatibleCurries.length > 0;
  }

  private isCurry(recipe: Recipe): boolean {
    const curryKeywords = ['curry', 'stew', 'sambar', 'rasam', 'dal', 'roast'];
    const title = recipe.title.toLowerCase();
    
    return curryKeywords.some(keyword => title.includes(keyword)) ||
           recipe.compatibleMains.length > 0;
  }

  getTimingAdvice(recipes: Recipe[]): string {
    const totalPrepTime = recipes.reduce((sum, r) => sum + r.prepMinutes, 0);
    const maxCookTime = Math.max(...recipes.map(r => r.cookMinutes));
    
    if (recipes.length === 1) {
      return `Total time: ${totalPrepTime + recipes[0].cookMinutes} minutes`;
    }

    return `Prep all ingredients first (${totalPrepTime} min), then cook in parallel. Total time: ~${totalPrepTime + maxCookTime} minutes`;
  }
}