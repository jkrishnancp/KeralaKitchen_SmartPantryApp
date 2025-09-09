import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Upload, FileText, Check, X, CreditCard as Edit3, Save, Trash2, Download, File, FileSpreadsheet } from 'lucide-react-native';
import { Recipe } from '@/types/database';
import { databaseService } from '@/services/database';
import { useAuthStore } from '@/store/useAuthStore';
import { importService, ImportResult } from '@/services/importService';

export default function ImportRecipesScreen() {
  const { user, isAdmin } = useAuthStore();
  const [jsonInput, setJsonInput] = useState('');
  const [parsedRecipes, setParsedRecipes] = useState<Partial<Recipe>[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [importMethod, setImportMethod] = useState<'json' | 'file'>('json');

  const sampleJson = `[
  {
    "title": "Malabar Fish Curry",
    "region": "Kerala",
    "tags": ["non-veg", "curry", "spicy"],
    "ingredients": [
      {"name": "fish", "amount": 500, "unit": "g", "optional": false},
      {"name": "coconut milk", "amount": 1, "unit": "cup", "optional": false},
      {"name": "tamarind", "amount": 1, "unit": "tbsp", "optional": false}
    ],
    "steps": [
      "Clean and cut fish into pieces",
      "Heat oil in a clay pot",
      "Add spices and cook until fragrant"
    ],
    "prepMinutes": 15,
    "cookMinutes": 25,
    "servings": 4,
    "caloriesPerServing": 280,
    "compatibleMains": ["rice", "appam"],
    "compatibleCurries": [],
    "notes": "Best cooked in clay pot for authentic taste"
  }
]`;

  if (!user || !isAdmin()) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <Text style={styles.unauthorizedTitle}>Access Denied</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const parseJsonInput = () => {
    try {
      const recipes = JSON.parse(jsonInput);
      if (!Array.isArray(recipes)) {
        throw new Error('JSON must be an array of recipes');
      }
      
      // Validate recipe structure
      const validatedRecipes = recipes.map((recipe, index) => {
        if (!recipe.title || !recipe.ingredients || !recipe.steps) {
          throw new Error(`Recipe at index ${index} is missing required fields`);
        }
        return {
          ...recipe,
          region: recipe.region || 'Kerala',
          tags: recipe.tags || [],
          compatibleMains: recipe.compatibleMains || [],
          compatibleCurries: recipe.compatibleCurries || [],
          prepMinutes: recipe.prepMinutes || 15,
          cookMinutes: recipe.cookMinutes || 30,
          servings: recipe.servings || 4
        };
      });
      
      setParsedRecipes(validatedRecipes);
      Alert.alert('Success', `Parsed ${validatedRecipes.length} recipes successfully!`);
    } catch (error) {
      Alert.alert('Parse Error', `Invalid JSON: ${error.message}`);
    }
  };

  const importRecipes = async () => {
    if (parsedRecipes.length === 0) {
      Alert.alert('No Recipes', 'Please parse some recipes first.');
      return;
    }

    setIsImporting(true);
    try {
      let successCount = 0;
      for (const recipe of parsedRecipes) {
        try {
          await databaseService.addRecipe(recipe as Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>);
          successCount++;
        } catch (error) {
          console.error(`Failed to import recipe: ${recipe.title}`, error);
        }
      }
      
      Alert.alert(
        'Import Complete',
        `Successfully imported ${successCount} out of ${parsedRecipes.length} recipes.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setParsedRecipes([]);
              setJsonInput('');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Import Failed', 'An error occurred during import.');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadJSONTemplate = async () => {
    try {
      const template = importService.generateJSONTemplate();
      await Share.share({
        message: template,
        title: 'Recipe JSON Template'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate JSON template');
    }
  };

  const downloadExcelTemplate = async () => {
    try {
      const templateUri = await importService.generateExcelTemplate();
      await Share.share({
        url: templateUri,
        title: 'Recipe Excel Template'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate Excel template');
    }
  };

  const handleFileImport = async () => {
    setIsImporting(true);
    try {
      const result: ImportResult = await importService.pickAndImportFile();
      
      if (result.success) {
        Alert.alert(
          'Import Successful',
          `Imported ${result.imported} recipes successfully.${result.failed > 0 ? `\n${result.failed} recipes failed.` : ''}`,
          [
            {
              text: 'View Errors',
              onPress: () => {
                if (result.errors.length > 0) {
                  Alert.alert('Import Errors', result.errors.join('\n'));
                }
              },
              style: 'default'
            },
            { text: 'OK', style: 'default' }
          ]
        );
      } else {
        Alert.alert('Import Failed', result.errors.join('\n'));
      }
    } catch (error) {
      Alert.alert('Import Error', error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const updateRecipe = (index: number, updates: Partial<Recipe>) => {
    const updated = [...parsedRecipes];
    updated[index] = { ...updated[index], ...updates };
    setParsedRecipes(updated);
  };

  const removeRecipe = (index: number) => {
    const updated = parsedRecipes.filter((_, i) => i !== index);
    setParsedRecipes(updated);
  };

  const renderRecipeCard = (recipe: Partial<Recipe>, index: number) => (
    <View key={index} style={styles.recipeCard}>
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeTitle}>{recipe.title}</Text>
        <View style={styles.recipeActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setEditingIndex(editingIndex === index ? null : index)}
          >
            <Edit3 size={16} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => removeRecipe(index)}
          >
            <Trash2 size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.recipeDetails}>
        <Text style={styles.recipeInfo}>
          {recipe.servings} servings • {(recipe.prepMinutes || 0) + (recipe.cookMinutes || 0)} min
        </Text>
        <Text style={styles.recipeIngredients}>
          {recipe.ingredients?.length || 0} ingredients
        </Text>
      </View>

      {editingIndex === index && (
        <View style={styles.editSection}>
          <TextInput
            style={styles.editInput}
            value={recipe.title}
            onChangeText={(text) => updateRecipe(index, { title: text })}
            placeholder="Recipe title"
          />
          <View style={styles.editRow}>
            <TextInput
              style={[styles.editInput, styles.smallInput]}
              value={recipe.servings?.toString()}
              onChangeText={(text) => updateRecipe(index, { servings: parseInt(text) || 4 })}
              placeholder="Servings"
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.editInput, styles.smallInput]}
              value={recipe.prepMinutes?.toString()}
              onChangeText={(text) => updateRecipe(index, { prepMinutes: parseInt(text) || 15 })}
              placeholder="Prep min"
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.editInput, styles.smallInput]}
              value={recipe.cookMinutes?.toString()}
              onChangeText={(text) => updateRecipe(index, { cookMinutes: parseInt(text) || 30 })}
              placeholder="Cook min"
              keyboardType="numeric"
            />
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Import Recipes</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Import Method Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Import Method</Text>
          <View style={styles.methodSelector}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                importMethod === 'json' && styles.activeMethodButton
              ]}
              onPress={() => setImportMethod('json')}
            >
              <FileText size={20} color={importMethod === 'json' ? '#ffffff' : '#6b7280'} />
              <Text style={[
                styles.methodButtonText,
                importMethod === 'json' && styles.activeMethodButtonText
              ]}>
                JSON Input
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.methodButton,
                importMethod === 'file' && styles.activeMethodButton
              ]}
              onPress={() => setImportMethod('file')}
            >
              <Upload size={20} color={importMethod === 'file' ? '#ffffff' : '#6b7280'} />
              <Text style={[
                styles.methodButtonText,
                importMethod === 'file' && styles.activeMethodButtonText
              ]}>
                File Upload
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {importMethod === 'json' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>JSON Input</Text>
          <Text style={styles.sectionSubtitle}>
            Paste your recipe JSON array below
          </Text>
          
          <TextInput
            style={styles.jsonInput}
            value={jsonInput}
            onChangeText={setJsonInput}
            placeholder={`Paste JSON here or try the sample...\n\n${sampleJson}`}
            multiline
            textAlignVertical="top"
          />
          
          <View style={styles.inputActions}>
            <TouchableOpacity
              style={styles.sampleButton}
              onPress={() => setJsonInput(sampleJson)}
            >
              <FileText size={16} color="#6b7280" />
              <Text style={styles.sampleButtonText}>Use Sample</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.parseButton}
              onPress={parseJsonInput}
              disabled={!jsonInput.trim()}
            >
              <Text style={styles.parseButtonText}>Parse JSON</Text>
            </TouchableOpacity>
          </View>
        </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>File Import</Text>
            <Text style={styles.sectionSubtitle}>
              Upload JSON or Excel files with recipe data
            </Text>
            
            {/* Template Downloads */}
            <View style={styles.templatesSection}>
              <Text style={styles.templatesTitle}>Download Templates:</Text>
              <View style={styles.templateButtons}>
                <TouchableOpacity
                  style={styles.templateButton}
                  onPress={downloadJSONTemplate}
                >
                  <File size={16} color="#16a34a" />
                  <Text style={styles.templateButtonText}>JSON Template</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.templateButton}
                  onPress={downloadExcelTemplate}
                >
                  <FileSpreadsheet size={16} color="#16a34a" />
                  <Text style={styles.templateButtonText}>Excel Template</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* File Upload */}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleFileImport}
              disabled={isImporting}
            >
              {isImporting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Upload size={20} color="#ffffff" />
              )}
              <Text style={styles.uploadButtonText}>
                {isImporting ? 'Importing...' : 'Select & Import File'}
              </Text>
            </TouchableOpacity>
            
            {/* Format Documentation */}
            <View style={styles.documentationSection}>
              <Text style={styles.docTitle}>Supported Formats:</Text>
              <View style={styles.formatInfo}>
                <Text style={styles.formatTitle}>📄 JSON Format:</Text>
                <Text style={styles.formatDescription}>
                  Array of recipe objects with title, ingredients, steps, etc.
                </Text>
                
                <Text style={styles.formatTitle}>📊 Excel Format:</Text>
                <Text style={styles.formatDescription}>
                  Spreadsheet with columns: Recipe Title, Region, Tags, Ingredients (JSON), Steps (pipe-separated), etc.
                </Text>
              </View>
            </View>
          </View>
        )}

        {parsedRecipes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.parsedHeader}>
              <Text style={styles.sectionTitle}>
                Parsed Recipes ({parsedRecipes.length})
              </Text>
              <TouchableOpacity
                style={styles.importButton}
                onPress={importRecipes}
                disabled={isImporting}
              >
                {isImporting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Upload size={16} color="#ffffff" />
                )}
                <Text style={styles.importButtonText}>
                  {isImporting ? 'Importing...' : 'Import All'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.recipesList}>
              {parsedRecipes.map(renderRecipeCard)}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  methodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeMethodButton: {
    backgroundColor: '#16a34a',
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeMethodButtonText: {
    color: '#ffffff',
  },
  templatesSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  templatesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  templateButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  templateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#16a34a',
    gap: 8,
  },
  templateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  documentationSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  formatInfo: {
    gap: 12,
  },
  formatTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  formatDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  jsonInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    fontFamily: 'monospace',
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    gap: 8,
  },
  sampleButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  parseButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  parseButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  parsedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  importButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  recipesList: {
    gap: 12,
  },
  recipeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  recipeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  recipeDetails: {
    marginBottom: 8,
  },
  recipeInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  recipeIngredients: {
    fontSize: 12,
    color: '#9ca3af',
  },
  editSection: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    marginTop: 8,
  },
  editInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  editRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallInput: {
    flex: 1,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});