export interface FoodItem {
  id: string;
  name: string;
  category: 'Staple' | 'Spice' | 'Vegetable' | 'Protein' | 'Dairy' | 'Oil' | 'Other';
  unit?: string; // g, ml, pcs, tbsp, tsp
  quantity?: number;
  bestBy?: string; // ISO date string
  source?: 'scanned' | 'manual' | 'barcode';
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  name: string;
  amount?: number;
  unit?: string; // tsp, tbsp, g, ml, pcs, cup
  optional: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  region: string; // "Kerala"
  tags: string[]; // e.g., "veg", "non-veg", "breakfast", "dinner"
  ingredients: RecipeIngredient[];
  steps: string[];
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  caloriesPerServing?: number;
  compatibleMains: string[]; // e.g., "appam", "puttu", "idiyappam", "rice"
  compatibleCurries: string[]; // for mains → curries
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScanRecord {
  id: string;
  originalImagePath?: string;
  recognizedText: string;
  parsedItems: ParsedLineItem[];
  createdAt: string;
}

export interface ParsedLineItem {
  raw: string;
  name: string;
  quantity?: number;
  unit?: string;
}

export interface RecipeMatchResult {
  recipe: Recipe;
  score: number; // 0-1, 1 = perfect match
  missingItems: string[];
  availableItems: string[];
}