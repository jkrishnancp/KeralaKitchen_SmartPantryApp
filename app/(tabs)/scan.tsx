import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { Camera, Image as ImageIcon, FileText, Plus, Check, X } from 'lucide-react-native';
import { scannerService } from '@/services/scannerService';
import { LocalReceiptParser } from '@/services/receiptParser';
import { databaseService } from '@/services/database';
import { ParsedLineItem } from '@/types/database';

export default function ScanScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<string>('');
  const [parsedItems, setParsedItems] = useState<ParsedLineItem[]>([]);
  const [showParsedItems, setShowParsedItems] = useState(false);

  const receiptParser = new LocalReceiptParser();

  const handleCameraScan = async () => {
    try {
      setIsScanning(true);
      const result = await scannerService.scanFromCamera();
      
      setOcrResult(result.text);
      const parsed = receiptParser.parseReceiptText(result.text);
      setParsedItems(parsed);
      setShowParsedItems(true);
      
    } catch (error: any) {
      Alert.alert('Scan Error', error.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleGalleryScan = async () => {
    try {
      setIsScanning(true);
      const result = await scannerService.scanFromGallery();
      
      setOcrResult(result.text);
      const parsed = receiptParser.parseReceiptText(result.text);
      setParsedItems(parsed);
      setShowParsedItems(true);
      
    } catch (error: any) {
      if (error.message !== 'Gallery selection cancelled') {
        Alert.alert('Scan Error', error.message);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualEntry = () => {
    Alert.prompt(
      'Manual Entry',
      'Paste receipt text or enter items manually:',
      (text: string) => {
        if (text && text.trim()) {
          setOcrResult(text);
          const parsed = receiptParser.parseReceiptText(text);
          setParsedItems(parsed);
          setShowParsedItems(true);
        }
      },
      'plain-text'
    );
  };

  const updateParsedItem = (index: number, updates: Partial<ParsedLineItem>) => {
    const updated = [...parsedItems];
    updated[index] = { ...updated[index], ...updates };
    setParsedItems(updated);
  };

  const removeParsedItem = (index: number) => {
    const updated = parsedItems.filter((_, i) => i !== index);
    setParsedItems(updated);
  };

  const addToInventory = async () => {
    try {
      for (const item of parsedItems) {
        if (item.name.trim()) {
          await databaseService.updateFoodItemQuantity(
            item.name,
            item.quantity || 1,
            item.unit
          );
        }
      }

      // Save scan record
      await databaseService.addScanRecord({
        recognizedText: ocrResult,
        parsedItems: parsedItems
      });

      Alert.alert(
        'Success',
        `Added ${parsedItems.length} items to your pantry!`,
        [{ text: 'OK', onPress: () => {
          setShowParsedItems(false);
          setParsedItems([]);
          setOcrResult('');
        }}]
      );

    } catch (error) {
      console.error('Error adding to inventory:', error);
      Alert.alert('Error', 'Failed to add items to inventory');
    }
  };

  const renderParsedItem = (item: ParsedLineItem, index: number) => (
    <View key={index} style={styles.parsedItem}>
      <View style={styles.itemHeader}>
        <TextInput
          style={styles.itemNameInput}
          value={item.name}
          onChangeText={(text) => updateParsedItem(index, { name: text })}
          placeholder="Item name"
        />
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeParsedItem(index)}
        >
          <X size={16} color="#dc2626" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.itemDetails}>
        <TextInput
          style={styles.quantityInput}
          value={item.quantity?.toString() || ''}
          onChangeText={(text) => {
            const qty = parseFloat(text) || undefined;
            updateParsedItem(index, { quantity: qty });
          }}
          placeholder="Qty"
          keyboardType="numeric"
        />
        
        <TextInput
          style={styles.unitInput}
          value={item.unit || ''}
          onChangeText={(text) => updateParsedItem(index, { unit: text })}
          placeholder="Unit"
        />
      </View>
      
      <Text style={styles.originalText}>Original: {item.raw}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan & Add</Text>
        <Text style={styles.headerSubtitle}>
          Scan receipts or photos to add items to your pantry
        </Text>
      </View>

      {!showParsedItems ? (
        <View style={styles.scanOptions}>
          {/* Scan with Camera */}
          <TouchableOpacity
            style={[styles.scanButton, styles.primaryButton]}
            onPress={handleCameraScan}
            disabled={isScanning}
          >
            <Camera size={32} color="#ffffff" />
            <Text style={styles.primaryButtonText}>
              {isScanning ? 'Scanning...' : 'Scan with Camera'}
            </Text>
            <Text style={styles.buttonSubtext}>
              Take a photo of your receipt
            </Text>
          </TouchableOpacity>

          {/* Pick from Gallery */}
          <TouchableOpacity
            style={[styles.scanButton, styles.secondaryButton]}
            onPress={handleGalleryScan}
            disabled={isScanning}
          >
            <ImageIcon size={32} color="#16a34a" />
            <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
            <Text style={styles.buttonSubtext}>
              Select an existing photo
            </Text>
          </TouchableOpacity>

          {/* Manual Entry */}
          <TouchableOpacity
            style={[styles.scanButton, styles.secondaryButton]}
            onPress={handleManualEntry}
            disabled={isScanning}
          >
            <FileText size={32} color="#16a34a" />
            <Text style={styles.secondaryButtonText}>Manual Entry</Text>
            <Text style={styles.buttonSubtext}>
              Type or paste receipt text
            </Text>
          </TouchableOpacity>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Scanning Tips</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>• Ensure good lighting</Text>
              <Text style={styles.tipItem}>• Keep receipt flat and straight</Text>
              <Text style={styles.tipItem}>• Avoid shadows and glare</Text>
              <Text style={styles.tipItem}>• Make sure text is clearly visible</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.parsedResults}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              Found {parsedItems.length} items
            </Text>
            <Text style={styles.resultsSubtitle}>
              Review and edit before adding to pantry
            </Text>
          </View>

          <ScrollView
            style={styles.itemsList}
            contentContainerStyle={styles.itemsListContent}
            showsVerticalScrollIndicator={false}
          >
            {parsedItems.map(renderParsedItem)}
          </ScrollView>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                setShowParsedItems(false);
                setParsedItems([]);
                setOcrResult('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={addToInventory}
              disabled={parsedItems.length === 0}
            >
              <Check size={16} color="#ffffff" />
              <Text style={styles.confirmButtonText}>
                Add to Pantry ({parsedItems.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    lineHeight: 22,
  },
  scanOptions: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scanButton: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#16a34a',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 4,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  tipsContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  tipsList: {
    gap: 6,
  },
  tipItem: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  parsedResults: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemsList: {
    flex: 1,
  },
  itemsListContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  parsedItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemNameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  quantityInput: {
    width: 80,
    fontSize: 14,
    color: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    textAlign: 'center',
  },
  unitInput: {
    width: 80,
    fontSize: 14,
    color: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  originalText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  confirmButton: {
    backgroundColor: '#16a34a',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 6,
  },
});