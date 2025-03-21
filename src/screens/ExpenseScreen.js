import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FooterTab from "../components/FooterTab";

const categories = [
  { id: 0, name: "All", icon: "view-grid", color: "#6C5CE7" },
  { id: 1, name: "Food", icon: "food", color: "#FF6B6B" },
  { id: 2, name: "Transport", icon: "car", color: "#4ECDC4" },
  { id: 3, name: "Shopping", icon: "shopping", color: "#45B7D1" },
  { id: 4, name: "Entertainment", icon: "movie", color: "#96CEB4" },
  { id: 5, name: "Health", icon: "medical-bag", color: "#FFEEAD" },
  { id: 6, name: "Education", icon: "book-open-variant", color: "#D4A5A5" },
];

const recentExpenses = [
  {
    id: 1,
    category: "Food",
    amount: 45.5,
    date: "2024-03-20T12:00:00",
    description: "Lunch at Restaurant",
    icon: "food",
    color: "#FF6B6B",
  },
  {
    id: 2,
    category: "Transport",
    amount: 25.0,
    date: "2024-03-19T15:30:00",
    description: "Bus Ticket",
    icon: "car",
    color: "#4ECDC4",
  },
  {
    id: 3,
    category: "Shopping",
    amount: 120.0,
    date: "2024-03-18T10:15:00",
    description: "Souvenirs",
    icon: "shopping",
    color: "#45B7D1",
  },
];

export const ExpenseScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(0);

  // Dummy data for monthly stats
  const monthlyStats = {
    totalExpenses: 1250.5,
    totalBudget: 2000.0,
    remainingBalance: 749.5,
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Expenses</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Manage your expenses
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("AddExpense")}
        >
          <MaterialCommunityIcons name="plus" size={24} color={theme.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMonthlyStats = () => (
    <View style={[styles.monthlyStats, { backgroundColor: theme.card }]}>
      <View style={styles.statsRow}>
        <View style={styles.statsItem}>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
            Total Expenses
          </Text>
          <Text style={[styles.statsValue, { color: theme.text }]}>
            ${monthlyStats.totalExpenses.toFixed(2)}
          </Text>
        </View>
        <View style={styles.statsItem}>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
            Remaining
          </Text>
          <Text style={[styles.statsValue, { color: theme.success }]}>
            ${monthlyStats.remainingBalance.toFixed(2)}
          </Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  (monthlyStats.totalExpenses / monthlyStats.totalBudget) * 100
                }%`,
                backgroundColor: theme.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
          {Math.round(
            (monthlyStats.totalExpenses / monthlyStats.totalBudget) * 100
          )}
          % of budget used
        </Text>
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Categories
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              {
                backgroundColor:
                  selectedCategory === category.id ? theme.border : theme.card,
              },
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <View
              style={[
                styles.categoryIcon,
                {
                  backgroundColor: `${category.color}20`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={category.icon}
                size={24}
                color={category.color}
              />
            </View>
            <Text
              style={[
                styles.categoryName,
                {
                  color:
                    selectedCategory === category.id ? theme.white : theme.text,
                },
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderRecentExpenses = () => (
    <View style={styles.recentExpenses}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Recent Expenses
        </Text>
        <TouchableOpacity>
          <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
        </TouchableOpacity>
      </View>
      {recentExpenses.map((expense) => (
        <TouchableOpacity
          key={expense.id}
          style={[styles.expenseItem, { backgroundColor: theme.card }]}
          onPress={() => {
            /* Navigate to Expense Details */
          }}
        >
          <View
            style={[
              styles.expenseIcon,
              {
                backgroundColor: `${expense.color}20`,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={expense.icon}
              size={20}
              color={expense.color}
            />
          </View>
          <View style={styles.expenseInfo}>
            <Text style={[styles.expenseName, { color: theme.text }]}>
              {expense.category}
            </Text>
            <Text style={[styles.expenseDate, { color: theme.textSecondary }]}>
              {new Date(expense.date).toLocaleDateString()}
            </Text>
          </View>
          <Text style={[styles.expenseAmount, { color: theme.text }]}>
            ${expense.amount.toFixed(2)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {renderHeader()}
      {renderMonthlyStats()}
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderCategories()}
        {renderRecentExpenses()}
      </ScrollView>
      <FooterTab navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  categoriesList: {
    paddingRight: 20,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
  },
  recentExpenses: {
    padding: 20,
    paddingBottom: 80,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
  },
  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  expenseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  expenseName: {
    fontSize: 15,
    fontWeight: "500",
  },
  expenseDate: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 1,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: "bold",
  },
  monthlyStats: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statsItem: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: "center",
  },
});
