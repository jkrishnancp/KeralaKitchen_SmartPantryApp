import { Recipe, RecipeIngredient } from '@/types/database';

export interface RecipeExtractorService {
  extractFromText(text: string): Promise<Partial<Recipe>>;
}

export class LocalRecipeExtractor implements RecipeExtractorService {
  async extractFromText(text: string): Promise<Partial<Recipe>> {
    // Simple rule-based extraction for now
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    let title = '';
    let ingredients: RecipeIngredient[] = [];
    let steps: string[] = [];
    let currentSection = 'title';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!title && currentSection === 'title') {
        title = trimmed;
        continue;
      }
      
      // Detect ingredients section
      if (/^ingredients?:?$/i.test(trimmed)) {
        currentSection = 'ingredients';
        continue;
      }
      
      // Detect instructions/method section
      if (/^(instructions?|method|steps?|directions?):?$/i.test(trimmed)) {
        currentSection = 'steps';
        continue;
      }
      
      if (currentSection === 'ingredients' && trimmed) {
        const ingredient = this.parseIngredient(trimmed);
        if (ingredient) {
          ingredients.push(ingredient);
        }
      } else if (currentSection === 'steps' && trimmed) {
        steps.push(trimmed.replace(/^\d+\.\s*/, ''));
      }
    }
    
    return {
      title: title || 'Untitled Recipe',
      region: 'Kerala',
      tags: this.inferTags(title, ingredients),
      ingredients,
      steps,
      prepMinutes: 15, // Default
      cookMinutes: 30, // Default  
      servings: 4, // Default
      compatibleMains: [],
      compatibleCurries: []
    };
  }

  private parseIngredient(line: string): RecipeIngredient | null {
    // Remove bullet points and numbers
    const cleaned = line.replace(/^[-*•\d+\.\)\s]+/, '').trim();
    
    // Pattern matching for ingredients with quantities
    const patterns = [
      // "2 cups rice", "1 tsp turmeric"
      /^(\d+(?:\.\d+)?|\d+\/\d+)\s+(cups?|tbsp|tsp|kg|g|ml|l|pcs?|pieces?|nos?)\s+(.+)/i,
      // "rice - 2 cups"
      /^(.+?)\s*[-–]\s*(\d+(?:\.\d+)?|\d+\/\d+)\s+(cups?|tbsp|tsp|kg|g|ml|l|pcs?|pieces?|nos?)/i,
      // Just ingredient name
      /^(.+)$/
    ];

    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (!match) continue;

      if (pattern.source.includes('(.+?).*[-–]')) {
        // Pattern with ingredient first, then quantity
        const [, name, quantity, unit] = match;
        return {
          name: name.trim(),
          amount: this.parseQuantity(quantity),
          unit: unit.toLowerCase(),
          optional: line.toLowerCase().includes('optional')
        };
      } else if (pattern.source.startsWith('^(\\d')) {
        // Pattern with quantity first
        const [, quantity, unit, name] = match;
        return {
          name: name.trim(),
          amount: this.parseQuantity(quantity),
          unit: unit.toLowerCase(),
          optional: line.toLowerCase().includes('optional')
        };
      } else {
        // Just ingredient name
        return {
          name: match[1].trim(),
          amount: undefined,
          unit: undefined,
          optional: line.toLowerCase().includes('optional')
        };
      }
    }

    return null;
  }

  private parseQuantity(qty: string): number {
    if (qty.includes('/')) {
      const [num, den] = qty.split('/').map(parseFloat);
      return num / den;
    }
    return parseFloat(qty);
  }

  private inferTags(title: string, ingredients: RecipeIngredient[]): string[] {
    const tags: string[] = [];
    const titleLower = title.toLowerCase();
    
    // Vegetarian/Non-vegetarian detection
    const nonVegIngredients = ['chicken', 'fish', 'meat', 'beef', 'mutton', 'pork', 'egg'];
    const hasNonVeg = ingredients.some(ing => 
      nonVegIngredients.some(nv => ing.name.toLowerCase().includes(nv))
    );
    
    tags.push(hasNonVeg ? 'non-veg' : 'veg');
    
    // Meal type detection
    if (titleLower.includes('breakfast') || 
        titleLower.includes('puttu') || 
        titleLower.includes('appam') || 
        titleLower.includes('idli') || 
        titleLower.includes('dosa')) {
      tags.push('breakfast');
    }
    
    if (titleLower.includes('curry') || 
        titleLower.includes('stew') || 
        titleLower.includes('sambar') || 
        titleLower.includes('rasam')) {
      tags.push('curry');
    }
    
    return tags;
  }
}

// TODO: AI-powered recipe extractor
export class AIRecipeExtractor implements RecipeExtractorService {
  async extractFromText(text: string): Promise<Partial<Recipe>> {
    // TODO: Implement LLM-based extraction
    // This would use a prompt like:
    // "Extract a structured Kerala/South Indian recipe from this text.
    //  Return JSON with: title, ingredients[{name, amount, unit, optional}], 
    //  steps[], prepMinutes, cookMinutes, servings, compatibleMains[], compatibleCurries[].
    //  Preserve authentic names (thoran, avial, kadala, meen, moru)."
    
    console.log('TODO: Implement AI recipe extraction');
    // Fallback to local extractor
    return new LocalRecipeExtractor().extractFromText(text);
  }
}