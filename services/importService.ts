import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { read, utils, WorkBook } from 'xlsx';
import { Recipe, RecipeIngredient } from '@/types/database';
import { databaseService } from './database';

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

export interface ImportService {
  importFromJSON(jsonContent: string): Promise<ImportResult>;
  importFromExcel(fileUri: string): Promise<ImportResult>;
  generateJSONTemplate(): string;
  generateExcelTemplate(): Promise<string>;
  pickAndImportFile(): Promise<ImportResult>;
}

export class RecipeImportService implements ImportService {
  
  async pickAndImportFile(): Promise<ImportResult> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return { success: false, imported: 0, failed: 0, errors: ['Import cancelled'] };
      }

      const file = result.assets[0];
      const fileExtension = file.name.toLowerCase().split('.').pop();

      if (fileExtension === 'json') {
        const content = await FileSystem.readAsStringAsync(file.uri);
        return this.importFromJSON(content);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        return this.importFromExcel(file.uri);
      } else {
        return { success: false, imported: 0, failed: 0, errors: ['Unsupported file format'] };
      }
    } catch (error) {
      return { success: false, imported: 0, failed: 0, errors: [`Import failed: ${error.message}`] };
    }
  }

  async importFromJSON(jsonContent: string): Promise<ImportResult> {
    const result: ImportResult = { success: true, imported: 0, failed: 0, errors: [] };
    
    try {
      const recipes = JSON.parse(jsonContent);
      
      if (!Array.isArray(recipes)) {
        throw new Error('JSON must contain an array of recipes');
      }

      for (let i = 0; i < recipes.length; i++) {
        try {
          const recipe = this.validateAndNormalizeRecipe(recipes[i], i);
          await databaseService.addRecipe(recipe);
          result.imported++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Recipe ${i + 1}: ${error.message}`);
        }
      }

      result.success = result.imported > 0;
    } catch (error) {
      result.success = false;
      result.errors.push(`JSON parsing failed: ${error.message}`);
    }

    return result;
  }

  async importFromExcel(fileUri: string): Promise<ImportResult> {
    const result: ImportResult = { success: true, imported: 0, failed: 0, errors: [] };
    
    try {
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const workbook: WorkBook = read(fileContent, { type: 'base64' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = utils.sheet_to_json(worksheet);

      for (let i = 0; i < jsonData.length; i++) {
        try {
          const recipe = this.convertExcelRowToRecipe(jsonData[i], i);
          await databaseService.addRecipe(recipe);
          result.imported++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Row ${i + 2}: ${error.message}`); // +2 for header row
        }
      }

      result.success = result.imported > 0;
    } catch (error) {
      result.success = false;
      result.errors.push(`Excel parsing failed: ${error.message}`);
    }

    return result;
  }

  generateJSONTemplate(): string {
    const template = [
      {
        title: "Traditional Appam",
        region: "Kerala",
        tags: ["veg", "breakfast", "fermented"],
        ingredients: [
          { name: "rice", amount: 2, unit: "cups", optional: false },
          { name: "coconut", amount: 1, unit: "cup", optional: false },
          { name: "coconut milk", amount: 0.5, unit: "cup", optional: false },
          { name: "sugar", amount: 1, unit: "tsp", optional: false },
          { name: "yeast", amount: 0.5, unit: "tsp", optional: false },
          { name: "salt", amount: 0.5, unit: "tsp", optional: false }
        ],
        steps: [
          "Soak rice for 4-5 hours",
          "Grind rice and coconut with little water to smooth batter",
          "Add coconut milk, sugar, yeast and salt",
          "Ferment overnight in warm place",
          "Heat appam pan, pour batter and swirl to form bowl shape",
          "Cover and cook until edges are golden and center is soft"
        ],
        prepMinutes: 30,
        cookMinutes: 20,
        servings: 4,
        caloriesPerServing: 180,
        compatibleMains: [],
        compatibleCurries: ["vegetable stew", "fish curry", "chicken curry", "egg roast"],
        notes: "Best served hot with stew or curry"
      },
      {
        title: "Kerala Fish Curry",
        region: "Kerala",
        tags: ["non-veg", "curry", "spicy"],
        ingredients: [
          { name: "fish", amount: 500, unit: "g", optional: false },
          { name: "coconut milk", amount: 1, unit: "cup", optional: false },
          { name: "tamarind", amount: 1, unit: "tbsp", optional: false },
          { name: "onion", amount: 1, unit: "pcs", optional: false },
          { name: "green chili", amount: 3, unit: "pcs", optional: false },
          { name: "curry leaves", amount: 15, unit: "pcs", optional: false },
          { name: "coconut oil", amount: 3, unit: "tbsp", optional: false }
        ],
        steps: [
          "Clean and cut fish into pieces",
          "Heat oil in clay pot, add curry leaves",
          "Add sliced onion, ginger, garlic, green chili",
          "Add spice powders, sauté until fragrant",
          "Add tamarind juice, bring to boil",
          "Add fish pieces gently, cook for 5 minutes",
          "Pour coconut milk, simmer until fish is done"
        ],
        prepMinutes: 15,
        cookMinutes: 25,
        servings: 4,
        caloriesPerServing: 280,
        compatibleMains: ["rice", "appam", "puttu", "porotta"],
        compatibleCurries: [],
        notes: "Use fresh fish and clay pot for authentic taste"
      }
    ];

    return JSON.stringify(template, null, 2);
  }

  async generateExcelTemplate(): Promise<string> {
    const templateData = [
      {
        'Recipe Title': 'Traditional Appam',
        'Region': 'Kerala',
        'Tags (comma-separated)': 'veg,breakfast,fermented',
        'Ingredients (JSON format)': JSON.stringify([
          { name: "rice", amount: 2, unit: "cups", optional: false },
          { name: "coconut", amount: 1, unit: "cup", optional: false }
        ]),
        'Steps (pipe-separated)': 'Soak rice for 4-5 hours|Grind rice and coconut with little water|Ferment overnight',
        'Prep Minutes': 30,
        'Cook Minutes': 20,
        'Servings': 4,
        'Calories Per Serving': 180,
        'Compatible Mains (comma-separated)': '',
        'Compatible Curries (comma-separated)': 'vegetable stew,fish curry',
        'Notes': 'Best served hot with stew or curry'
      },
      {
        'Recipe Title': 'Kerala Fish Curry',
        'Region': 'Kerala',
        'Tags (comma-separated)': 'non-veg,curry,spicy',
        'Ingredients (JSON format)': JSON.stringify([
          { name: "fish", amount: 500, unit: "g", optional: false },
          { name: "coconut milk", amount: 1, unit: "cup", optional: false }
        ]),
        'Steps (pipe-separated)': 'Clean and cut fish|Heat oil in clay pot|Add spices and cook',
        'Prep Minutes': 15,
        'Cook Minutes': 25,
        'Servings': 4,
        'Calories Per Serving': 280,
        'Compatible Mains (comma-separated)': 'rice,appam,puttu',
        'Compatible Curries (comma-separated)': '',
        'Notes': 'Use fresh fish and clay pot for authentic taste'
      }
    ];

    try {
      const worksheet = utils.json_to_sheet(templateData);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Recipes');
      
      // Generate base64 content
      const excelBuffer = write(workbook, { type: 'base64', bookType: 'xlsx' });
      
      // Save to app directory
      const fileName = 'recipe_template.xlsx';
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, excelBuffer, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      return fileUri;
    } catch (error) {
      throw new Error(`Failed to generate Excel template: ${error.message}`);
    }
  }

  private validateAndNormalizeRecipe(data: any, index: number): Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> {
    if (!data.title || typeof data.title !== 'string') {
      throw new Error('Missing or invalid title');
    }

    if (!data.ingredients || !Array.isArray(data.ingredients)) {
      throw new Error('Missing or invalid ingredients array');
    }

    if (!data.steps || !Array.isArray(data.steps)) {
      throw new Error('Missing or invalid steps array');
    }

    // Validate ingredients
    const ingredients: RecipeIngredient[] = data.ingredients.map((ing: any, i: number) => {
      if (!ing.name || typeof ing.name !== 'string') {
        throw new Error(`Ingredient ${i + 1}: missing or invalid name`);
      }
      return {
        name: ing.name,
        amount: typeof ing.amount === 'number' ? ing.amount : undefined,
        unit: typeof ing.unit === 'string' ? ing.unit : undefined,
        optional: Boolean(ing.optional)
      };
    });

    return {
      title: data.title,
      region: data.region || 'Kerala',
      tags: Array.isArray(data.tags) ? data.tags : [],
      ingredients,
      steps: data.steps.filter((step: any) => typeof step === 'string'),
      prepMinutes: typeof data.prepMinutes === 'number' ? data.prepMinutes : 15,
      cookMinutes: typeof data.cookMinutes === 'number' ? data.cookMinutes : 30,
      servings: typeof data.servings === 'number' ? data.servings : 4,
      caloriesPerServing: typeof data.caloriesPerServing === 'number' ? data.caloriesPerServing : undefined,
      compatibleMains: Array.isArray(data.compatibleMains) ? data.compatibleMains : [],
      compatibleCurries: Array.isArray(data.compatibleCurries) ? data.compatibleCurries : [],
      notes: typeof data.notes === 'string' ? data.notes : undefined
    };
  }

  private convertExcelRowToRecipe(row: any, index: number): Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> {
    try {
      const ingredients = JSON.parse(row['Ingredients (JSON format)'] || '[]');
      const steps = (row['Steps (pipe-separated)'] || '').split('|').filter((s: string) => s.trim());
      const tags = (row['Tags (comma-separated)'] || '').split(',').map((t: string) => t.trim()).filter(Boolean);
      const compatibleMains = (row['Compatible Mains (comma-separated)'] || '').split(',').map((m: string) => m.trim()).filter(Boolean);
      const compatibleCurries = (row['Compatible Curries (comma-separated)'] || '').split(',').map((c: string) => c.trim()).filter(Boolean);

      return {
        title: row['Recipe Title'] || `Recipe ${index + 1}`,
        region: row['Region'] || 'Kerala',
        tags,
        ingredients,
        steps,
        prepMinutes: parseInt(row['Prep Minutes']) || 15,
        cookMinutes: parseInt(row['Cook Minutes']) || 30,
        servings: parseInt(row['Servings']) || 4,
        caloriesPerServing: parseInt(row['Calories Per Serving']) || undefined,
        compatibleMains,
        compatibleCurries,
        notes: row['Notes'] || undefined
      };
    } catch (error) {
      throw new Error(`Invalid data format: ${error.message}`);
    }
  }
}

export const importService = new RecipeImportService();