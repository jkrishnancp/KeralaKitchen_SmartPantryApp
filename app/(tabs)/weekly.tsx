import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Calendar, Plus, Clock, Users, ChefHat } from 'lucide-react-native';

export default function WeeklyPlanScreen() {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  const daysOfWeek = [
    { key: 0, label: 'Sun', fullName: 'Sunday' },
    { key: 1, label: 'Mon', fullName: 'Monday' },
    { key: 2, label: 'Tue', fullName: 'Tuesday' },
    { key: 3, label: 'Wed', fullName: 'Wednesday' },
    { key: 4, label: 'Thu', fullName: 'Thursday' },
    { key: 5, label: 'Fri', fullName: 'Friday' },
    { key: 6, label: 'Sat', fullName: 'Saturday' },
  ];

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: '🌅', color: '#f59e0b' },
    { key: 'lunch', label: 'Lunch', icon: '☀️', color: '#16a34a' },
    { key: 'dinner', label: 'Dinner', icon: '🌙', color: '#8b5cf6' },
  ];

  // Mock planned meals
  const plannedMeals = {
    1: { // Monday
      breakfast: { name: 'Appam with Vegetable Stew', time: 30, servings: 4 },
      lunch: { name: 'Rice with Sambar and Thoran', time: 45, servings: 4 },
      dinner: { name: 'Puttu with Kadala Curry', time: 35, servings: 4 },
    },
    2: { // Tuesday
      breakfast: { name: 'Dosa with Coconut Chutney', time: 25, servings: 4 },
      lunch: { name: 'Rice with Fish Curry', time: 50, servings: 4 },
    },
  };

  const renderDaySelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.daySelector}
    >
      {daysOfWeek.map((day) => (
        <TouchableOpacity
          key={day.key}
          style={[
            styles.dayButton,
            selectedDay === day.key && styles.selectedDayButton
          ]}
          onPress={() => setSelectedDay(day.key)}
        >
          <Text style={[
            styles.dayLabel,
            selectedDay === day.key && styles.selectedDayLabel
          ]}>
            {day.label}
          </Text>
          <Text style={[
            styles.dayNumber,
            selectedDay === day.key && styles.selectedDayNumber
          ]}>
            {new Date().getDate() + (day.key - new Date().getDay())}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderMealSlot = (mealType: any) => {
    const meal = plannedMeals[selectedDay]?.[mealType.key];
    
    return (
      <View key={mealType.key} style={styles.mealSlot}>
        <View style={styles.mealHeader}>
          <View style={styles.mealTypeInfo}>
            <Text style={styles.mealIcon}>{mealType.icon}</Text>
            <Text style={styles.mealLabel}>{mealType.label}</Text>
          </View>
          
          <TouchableOpacity style={styles.addMealButton}>
            <Plus size={20} color="#16a34a" />
          </TouchableOpacity>
        </View>
        
        {meal ? (
          <View style={styles.plannedMeal}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <View style={styles.mealDetails}>
              <View style={styles.mealDetail}>
                <Clock size={14} color="#6b7280" />
                <Text style={styles.mealDetailText}>{meal.time} min</Text>
              </View>
              <View style={styles.mealDetail}>
                <Users size={14} color="#6b7280" />
                <Text style={styles.mealDetailText}>{meal.servings} servings</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyMeal}>
            <Text style={styles.emptyMealText}>No meal planned</Text>
            <TouchableOpacity style={styles.planMealButton}>
              <Text style={styles.planMealButtonText}>Plan Meal</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const selectedDayName = daysOfWeek.find(d => d.key === selectedDay)?.fullName || 'Today';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Meal Plan</Text>
        <Text style={styles.headerSubtitle}>
          Plan your Kerala kitchen adventures
        </Text>
      </View>

      <View style={styles.dayContainer}>
        {renderDaySelector()}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>{selectedDayName}</Text>
          <Text style={styles.dayDate}>
            {new Date(Date.now() + (selectedDay - new Date().getDay()) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>

        <View style={styles.mealsContainer}>
          {mealTypes.map(renderMealSlot)}
        </View>

        {/* Weekly Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>This Week's Summary</Text>
          
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <ChefHat size={24} color="#16a34a" />
              <Text style={styles.summaryNumber}>12</Text>
              <Text style={styles.summaryLabel}>Meals Planned</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Clock size={24} color="#f59e0b" />
              <Text style={styles.summaryNumber}>6.5h</Text>
              <Text style={styles.summaryLabel}>Total Cook Time</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Users size={24} color="#8b5cf6" />
              <Text style={styles.summaryNumber}>28</Text>
              <Text style={styles.summaryLabel}>Total Servings</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Generate Shopping List</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Auto-Plan Week
            </Text>
          </TouchableOpacity>
        </View>
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
  dayContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  daySelector: {
    paddingHorizontal: 20,
  },
  dayButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  selectedDayButton: {
    backgroundColor: '#16a34a',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  selectedDayLabel: {
    color: '#ffffff',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  selectedDayNumber: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dayHeader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  dayDate: {
    fontSize: 16,
    color: '#6b7280',
  },
  mealsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  mealSlot: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  mealLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  addMealButton: {
    padding: 4,
  },
  plannedMeal: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  mealDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  mealDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealDetailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  emptyMeal: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyMealText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  planMealButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  planMealButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  quickActions: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButtonText: {
    color: '#374151',
  },
});