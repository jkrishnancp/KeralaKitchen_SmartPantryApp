import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Search, Plus, Trash2, CreditCard as Edit3, Package2, TriangleAlert as AlertTriangle, Upload } from 'lucide-react-native';
import { FoodItem } from '@/types/database';
import { databaseService } from '@/services/database';
import { importService } from '@/services/importService';

export default function InventoryScreen() {
  const [inventory, setInventory] = useState<FoodItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'Staple', label: 'Staples' },
    { key: 'Spice', label: 'Spices' },
    { key: 'Vegetable', label: 'Vegetables' },
    { key: 'Protein', label: 'Proteins' },
    { key: 'Dairy', label: 'Dairy' },
    { key: 'Oil', label: 'Oils' },
  ];

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [inventory, searchQuery, selectedCategory]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const items = await databaseService.getAllFoodItems();
      setInventory(items);
    } catch (error) {
      console.error('Error loading inventory:', error);
      Alert.alert('Error', 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const filterInventory = () => {
    let filtered = inventory;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredInventory(filtered);
  };

  const addNewItem = () => {
    Alert.prompt(
      'Add Item',
      'Enter item name:',
      async (name: string) => {
        if (name && name.trim()) {
          try {
            await databaseService.addFoodItem({
              name: name.trim(),
              category: 'Other',
              source: 'manual'
            });
            loadInventory();
          } catch (error) {
            Alert.alert('Error', 'Failed to add item');
          }
        }
      }
    );
  };

  const handleImportInventory = async () => {
    Alert.alert(
      'Import Inventory',
      'Choose import method:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Excel File', 
          onPress: async () => {
            try {
              // TODO: Implement inventory Excel import
              Alert.alert('Coming Soon', 'Excel import for inventory will be available soon.');
            } catch (error) {
              Alert.alert('Error', 'Failed to import inventory');
            }
          }
        }
      ]
    );
  };

  const editItem = (item: FoodItem) => {
    Alert.prompt(
      'Edit Quantity',
      `Update quantity for ${item.name}:`,
      async (quantity: string) => {
        const qty = parseFloat(quantity);
        if (!isNaN(qty)) {
          try {
            await databaseService.updateFoodItemQuantity(item.name, qty - (item.quantity || 0), item.unit);
            loadInventory();
          } catch (error) {
            Alert.alert('Error', 'Failed to update item');
          }
        }
      },
      'numeric',
      item.quantity?.toString() || '0'
    );
  };

  const deleteItem = (item: FoodItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteFoodItem(item.id);
              loadInventory();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          }
        }
      ]
    );
  };

  const isExpiringSoon = (item: FoodItem): boolean => {
    if (!item.bestBy) return false;
    
    try {
      const expiryDate = parseISO(item.bestBy);
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);
      
      return isAfter(expiryDate, today) && !isAfter(expiryDate, threeDaysFromNow);
    } catch {
      return false;
    }
  };

  const getItemStatusColor = (item: FoodItem): string => {
    if ((item.quantity || 0) <= 1) return '#f59e0b';
    return '#6b7280';
  };

  const renderInventoryItem = (item: FoodItem) => {
    const statusColor = getItemStatusColor(item);
    const showWarning = (item.quantity || 0) <= 1;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.inventoryItem}
        onPress={() => editItem(item)}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          {showWarning && (
            <AlertTriangle size={14} color={statusColor} />
          )}
        </View>
        
        <Text style={[styles.itemCategory, { color: statusColor }]}>
          {item.category}
        </Text>
        
        {item.quantity !== undefined && (
          <Text style={styles.itemQuantity}>
            {item.quantity} {item.unit || 'pcs'}
          </Text>
        )}
        
        {(item.quantity || 0) <= 1 && (
          <Text style={styles.lowStockText}>Low stock</Text>
        )}

        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => editItem(item)}
          >
            <Edit3 size={16} color="#6b7280" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteItem(item)}
          >
            <Trash2 size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Pantry</Text>
        <Text style={styles.headerSubtitle}>
          {inventory.length} items • {filteredInventory.length} shown
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search inventory..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
        
        <TouchableOpacity style={styles.addButton} onPress={addNewItem}>
          <Plus size={20} color="#16a34a" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.importButton} onPress={handleImportInventory}>
          <Upload size={20} color="#16a34a" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryChip,
              selectedCategory === category.key && styles.activeCategory
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.key && styles.activeCategoryText
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Inventory List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.inventoryList}
        showsVerticalScrollIndicator={false}
      >
        {filteredInventory.length === 0 ? (
          <View style={styles.emptyState}>
            <Package2 size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>
              {inventory.length === 0 ? 'No items in pantry' : 'No items found'}
            </Text>
            <Text style={styles.emptyText}>
              {inventory.length === 0 
                ? 'Start by scanning a receipt or adding items manually'
                : 'Try adjusting your search or category filter'
              }
            </Text>
            
            {inventory.length === 0 && (
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={addNewItem}
              >
                <Plus size={16} color="#ffffff" />
                <Text style={styles.emptyActionText}>Add First Item</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredInventory.map(renderInventoryItem)
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  addButton: {
    marginLeft: 12,
    padding: 4,
  },
  importButton: {
    marginLeft: 8,
    padding: 4,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  activeCategory: {
    backgroundColor: '#16a34a',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeCategoryText: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  inventoryList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  inventoryItem: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  itemCategory: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 4,
  },
  lowStockText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginBottom: 8,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
});