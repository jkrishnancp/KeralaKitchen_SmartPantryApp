import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { TrendingUp, Target, Flame, Award, Calendar, ChartBar as BarChart3 } from 'lucide-react-native';

export default function CaloriesScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [dailyGoal] = useState(2000);
  const [consumedCalories] = useState(1650);

  const periods = [
    { key: 'day', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  // Mock data for recent meals
  const recentMeals = [
    { name: 'Appam with Vegetable Stew', calories: 320, time: '8:30 AM', type: 'breakfast' },
    { name: 'Rice with Fish Curry', calories: 580, time: '1:15 PM', type: 'lunch' },
    { name: 'Puttu with Kadala Curry', calories: 450, time: '7:45 PM', type: 'dinner' },
    { name: 'Coconut Water', calories: 45, time: '3:30 PM', type: 'snack' },
    { name: 'Banana', calories: 105, time: '5:00 PM', type: 'snack' },
  ];

  // Mock weekly data
  const weeklyData = [
    { day: 'Mon', calories: 1850, goal: 2000 },
    { day: 'Tue', calories: 2100, goal: 2000 },
    { day: 'Wed', calories: 1750, goal: 2000 },
    { day: 'Thu', calories: 1950, goal: 2000 },
    { day: 'Fri', calories: 2200, goal: 2000 },
    { day: 'Sat', calories: 1650, goal: 2000 },
    { day: 'Sun', calories: 1800, goal: 2000 },
  ];

  const calorieProgress = (consumedCalories / dailyGoal) * 100;
  const remainingCalories = Math.max(0, dailyGoal - consumedCalories);

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return '#f59e0b';
      case 'lunch': return '#16a34a';
      case 'dinner': return '#8b5cf6';
      case 'snack': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodButton,
            selectedPeriod === period.key && styles.selectedPeriodButton
          ]}
          onPress={() => setSelectedPeriod(period.key)}
        >
          <Text style={[
            styles.periodText,
            selectedPeriod === period.key && styles.selectedPeriodText
          ]}>
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCalorieProgress = () => (
    <View style={styles.progressSection}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Daily Goal Progress</Text>
        <Text style={styles.progressPercentage}>{Math.round(calorieProgress)}%</Text>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${Math.min(calorieProgress, 100)}%` }
            ]} 
          />
        </View>
      </View>
      
      <View style={styles.progressStats}>
        <View style={styles.progressStat}>
          <Text style={styles.progressStatNumber}>{consumedCalories}</Text>
          <Text style={styles.progressStatLabel}>Consumed</Text>
        </View>
        
        <View style={styles.progressStat}>
          <Text style={styles.progressStatNumber}>{remainingCalories}</Text>
          <Text style={styles.progressStatLabel}>Remaining</Text>
        </View>
        
        <View style={styles.progressStat}>
          <Text style={styles.progressStatNumber}>{dailyGoal}</Text>
          <Text style={styles.progressStatLabel}>Goal</Text>
        </View>
      </View>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsCard}>
        <Flame size={24} color="#ef4444" />
        <Text style={styles.statsNumber}>1,650</Text>
        <Text style={styles.statsLabel}>Today's Calories</Text>
      </View>
      
      <View style={styles.statsCard}>
        <Target size={24} color="#16a34a" />
        <Text style={styles.statsNumber}>2,000</Text>
        <Text style={styles.statsLabel}>Daily Goal</Text>
      </View>
      
      <View style={styles.statsCard}>
        <Award size={24} color="#f59e0b" />
        <Text style={styles.statsNumber}>5</Text>
        <Text style={styles.statsLabel}>Streak Days</Text>
      </View>
    </View>
  );

  const renderWeeklyChart = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Weekly Overview</Text>
      <View style={styles.chartContainer}>
        {weeklyData.map((data, index) => {
          const percentage = (data.calories / data.goal) * 100;
          const isToday = index === 5; // Saturday (today)
          
          return (
            <View key={data.day} style={styles.chartBar}>
              <View style={styles.chartBarContainer}>
                <View 
                  style={[
                    styles.chartBarFill,
                    { 
                      height: `${Math.min(percentage, 100)}%`,
                      backgroundColor: isToday ? '#16a34a' : '#e5e7eb'
                    }
                  ]} 
                />
              </View>
              <Text style={[
                styles.chartBarLabel,
                isToday && styles.chartBarLabelActive
              ]}>
                {data.day}
              </Text>
              <Text style={styles.chartBarValue}>{data.calories}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderRecentMeals = () => (
    <View style={styles.mealsSection}>
      <Text style={styles.mealsTitle}>Today's Meals</Text>
      
      {recentMeals.map((meal, index) => (
        <View key={index} style={styles.mealItem}>
          <View style={styles.mealInfo}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealIcon}>{getMealTypeIcon(meal.type)}</Text>
              <View style={styles.mealDetails}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealTime}>{meal.time}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.mealCalories}>
            <Text style={styles.mealCaloriesNumber}>{meal.calories}</Text>
            <Text style={styles.mealCaloriesLabel}>cal</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nutrition Tracker</Text>
        <Text style={styles.headerSubtitle}>
          Track your Kerala cuisine calories
        </Text>
      </View>

      {renderPeriodSelector()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderCalorieProgress()}
        {renderStatsCards()}
        {renderWeeklyChart()}
        {renderRecentMeals()}
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedPeriodButton: {
    backgroundColor: '#16a34a',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  selectedPeriodText: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#16a34a',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#16a34a',
    borderRadius: 6,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statsCard: {
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
  statsNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  chartSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarContainer: {
    height: 80,
    width: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 10,
  },
  chartBarLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    fontWeight: '500',
  },
  chartBarLabelActive: {
    color: '#16a34a',
    fontWeight: '600',
  },
  chartBarValue: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  mealsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  mealInfo: {
    flex: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  mealDetails: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  mealTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  mealCalories: {
    alignItems: 'flex-end',
  },
  mealCaloriesNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16a34a',
  },
  mealCaloriesLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
});