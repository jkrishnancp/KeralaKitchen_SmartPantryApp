import * as SQLite from 'expo-sqlite';
import { FoodItem, Recipe, ScanRecord, ParsedLineItem } from '@/types/database';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize() {
    this.db = await SQLite.openDatabaseAsync('kerala_kitchen.db');
    
    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS food_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        unit TEXT,
        quantity REAL,
        best_by TEXT,
        source TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS recipes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        region TEXT NOT NULL,
        tags TEXT NOT NULL, -- JSON array
        ingredients TEXT NOT NULL, -- JSON array
        steps TEXT NOT NULL, -- JSON array
        prep_minutes INTEGER NOT NULL,
        cook_minutes INTEGER NOT NULL,
        servings INTEGER NOT NULL,
        calories_per_serving INTEGER,
        compatible_mains TEXT NOT NULL, -- JSON array
        compatible_curries TEXT NOT NULL, -- JSON array
        notes TEXT,
        image_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS scan_records (
        id TEXT PRIMARY KEY,
        original_image_path TEXT,
        recognized_text TEXT NOT NULL,
        parsed_items TEXT NOT NULL, -- JSON array
        created_at TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_food_items_name ON food_items(name);
      CREATE INDEX IF NOT EXISTS idx_recipes_tags ON recipes(tags);
      CREATE INDEX IF NOT EXISTS idx_recipes_region ON recipes(region);
    `);
  }

  // Food Items
  async getAllFoodItems(): Promise<FoodItem[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const rows = await this.db.getAllAsync('SELECT * FROM food_items ORDER BY name');
    return rows.map(this.mapRowToFoodItem);
  }

  async addFoodItem(item: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');
    
    const id = `fi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    await this.db.runAsync(
      `INSERT INTO food_items (id, name, category, unit, quantity, best_by, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, item.name, item.category, item.unit, item.quantity, item.bestBy, item.source, now, now]
    );
    
    return id;
  }

  async updateFoodItemQuantity(name: string, quantity: number, unit?: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    const existing = await this.db.getFirstAsync(
      'SELECT * FROM food_items WHERE LOWER(name) = LOWER(?)',
      [name]
    );

    if (existing) {
      const currentQty = (existing as any).quantity || 0;
      await this.db.runAsync(
        'UPDATE food_items SET quantity = ?, unit = ?, updated_at = ? WHERE id = ?',
        [currentQty + quantity, unit || (existing as any).unit, now, (existing as any).id]
      );
    } else {
      await this.addFoodItem({
        name,
        category: 'Other',
        quantity,
        unit,
        source: 'scanned'
      });
    }
  }

  async deleteFoodItem(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM food_items WHERE id = ?', [id]);
  }

  // Recipes
  async getAllRecipes(): Promise<Recipe[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const rows = await this.db.getAllAsync('SELECT * FROM recipes ORDER BY title');
    return rows.map(this.mapRowToRecipe);
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const row = await this.db.getFirstAsync('SELECT * FROM recipes WHERE id = ?', [id]);
    return row ? this.mapRowToRecipe(row) : null;
  }

  async addRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');
    
    const id = `r_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    await this.db.runAsync(
      `INSERT INTO recipes (id, title, region, tags, ingredients, steps, prep_minutes, cook_minutes, 
       servings, calories_per_serving, compatible_mains, compatible_curries, notes, image_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, recipe.title, recipe.region, JSON.stringify(recipe.tags),
        JSON.stringify(recipe.ingredients), JSON.stringify(recipe.steps),
        recipe.prepMinutes, recipe.cookMinutes, recipe.servings, recipe.caloriesPerServing,
        JSON.stringify(recipe.compatibleMains), JSON.stringify(recipe.compatibleCurries),
        recipe.notes, recipe.imageUrl, now, now
      ]
    );
    
    return id;
  }

  async deleteRecipe(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM recipes WHERE id = ?', [id]);
  }

  // Scan Records
  async addScanRecord(record: Omit<ScanRecord, 'id' | 'createdAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');
    
    const id = `sr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    await this.db.runAsync(
      'INSERT INTO scan_records (id, original_image_path, recognized_text, parsed_items, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, record.originalImagePath, record.recognizedText, JSON.stringify(record.parsedItems), now]
    );
    
    return id;
  }

  // Helper methods
  private mapRowToFoodItem = (row: any): FoodItem => ({
    id: row.id,
    name: row.name,
    category: row.category,
    unit: row.unit,
    quantity: row.quantity,
    bestBy: row.best_by,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });

  private mapRowToRecipe = (row: any): Recipe => ({
    id: row.id,
    title: row.title,
    region: row.region,
    tags: JSON.parse(row.tags),
    ingredients: JSON.parse(row.ingredients),
    steps: JSON.parse(row.steps),
    prepMinutes: row.prep_minutes,
    cookMinutes: row.cook_minutes,
    servings: row.servings,
    caloriesPerServing: row.calories_per_serving,
    compatibleMains: JSON.parse(row.compatible_mains),
    compatibleCurries: JSON.parse(row.compatible_curries),
    notes: row.notes,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
}

export const databaseService = new DatabaseService();