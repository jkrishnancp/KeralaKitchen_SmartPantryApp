import { Recipe } from '@/types/database';
import seedRecipesData from './seedRecipes.json';
import { databaseService } from '@/services/database';

export class SeedDataService {
  async initializeDatabase() {
    try {
      await databaseService.initialize();
      
      // Check if recipes are already seeded
      const existingRecipes = await databaseService.getAllRecipes();
      
      if (existingRecipes.length === 0) {
        console.log('Seeding initial recipes...');
        await this.seedRecipes();
        console.log('Database seeded successfully');
      }
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  private async seedRecipes() {
    const recipes = seedRecipesData as Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>[];
    
    for (const recipe of recipes) {
      try {
        await databaseService.addRecipe(recipe);
      } catch (error) {
        console.error(`Error seeding recipe ${recipe.title}:`, error);
      }
    }
  }

  // Seed some sample pantry items for testing
  async seedSamplePantry() {
    const sampleItems = [
      { name: 'rice', category: 'Staple' as const, quantity: 2, unit: 'kg' },
      { name: 'coconut oil', category: 'Oil' as const, quantity: 500, unit: 'ml' },
      { name: 'onion', category: 'Vegetable' as const, quantity: 1, unit: 'kg' },
      { name: 'tomato', category: 'Vegetable' as const, quantity: 500, unit: 'g' },
      { name: 'ginger', category: 'Spice' as const, quantity: 100, unit: 'g' },
      { name: 'garlic', category: 'Spice' as const, quantity: 50, unit: 'g' },
      { name: 'curry leaves', category: 'Spice' as const, quantity: 20, unit: 'pcs' },
      { name: 'mustard seeds', category: 'Spice' as const, quantity: 100, unit: 'g' },
      { name: 'turmeric powder', category: 'Spice' as const, quantity: 50, unit: 'g' },
      { name: 'red chili powder', category: 'Spice' as const, quantity: 50, unit: 'g' },
      { name: 'coconut', category: 'Other' as const, quantity: 2, unit: 'pcs' },
      { name: 'eggs', category: 'Protein' as const, quantity: 12, unit: 'pcs' },
      { name: 'milk', category: 'Dairy' as const, quantity: 1, unit: 'l' }
    ];

    for (const item of sampleItems) {
      try {
        await databaseService.addFoodItem({
          ...item,
          source: 'manual'
        });
      } catch (error) {
        console.error(`Error seeding pantry item ${item.name}:`, error);
      }
    }
  }
}

export const seedDataService = new SeedDataService();