import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FooterTab from "../components/FooterTab";
import { Header } from "../components/Header";
import { CategoryList } from "../components/CategoryList";
import { ExpenseList } from "../components/ExpenseList";
import { expenseService } from "../services/expenseService";

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
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({
    totalExpenses: 0,
    totalBudget: 0,
    remainingBalance: 0,
  });

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      console.log("Fetching expenses...");
      const data = await expenseService.getExpenses(
        selectedCategory === 0 ? null : categories[selectedCategory].name
      );
      console.log("Fetched expenses:", data);

      if (data && data.length > 0) {
        setExpenses(data);
        // Calculate monthly stats
        const totalExpenses = data.reduce(
          (sum, expense) => sum + expense.amount,
          0
        );
        setMonthlyStats({
          totalExpenses,
          totalBudget: 2000.0, // This should come from your budget settings
          remainingBalance: 2000.0 - totalExpenses,
        });
      } else {
        setExpenses([]);
        setMonthlyStats({
          totalExpenses: 0,
          totalBudget: 2000.0,
          remainingBalance: 2000.0,
        });
      }
    } catch (error) {
      console.error("Error fetching expenses:", error.message);
      Alert.alert("Error", "Failed to fetch expenses. Please try again later.");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const renderAddButton = () => (
    <TouchableOpacity
      style={[styles.addButton, { backgroundColor: theme.primary }]}
      onPress={() => navigation.navigate("AddExpense")}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <MaterialCommunityIcons name="plus" size={24} color={theme.white} />
    </TouchableOpacity>
  );

  const renderMonthlyStats = () => (
    <View style={[styles.monthlyStats, { backgroundColor: theme.card }]}>
      <View style={styles.statsRow}>
        <View style={styles.statsItem}>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
            Total Expenses
          </Text>
          <Text style={[styles.statsValue, { color: theme.text }]}>
            ₹{monthlyStats.totalExpenses.toFixed(2)}
          </Text>
        </View>
        <View style={styles.statsItem}>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
            Remaining
          </Text>
          <Text style={[styles.statsValue, { color: theme.success }]}>
            ₹{monthlyStats.remainingBalance.toFixed(2)}
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

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="receipt-text-outline"
        size={64}
        color={theme.textSecondary}
      />
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        No expenses found
      </Text>
      <TouchableOpacity
        style={[styles.addExpenseButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate("AddExpense")}
      >
        <MaterialCommunityIcons name="plus" size={24} color={theme.white} />
        <Text style={[styles.addExpenseText, { color: theme.white }]}>
          Add Your First Expense
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <Header
          title="Expenses"
          onBack={() => navigation.goBack()}
          rightComponent={renderAddButton()}
          showBack={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title="Expenses"
        onBack={() => navigation.goBack()}
        rightComponent={renderAddButton()}
        showBack={false}
      />
      <View style={{ marginTop: 10 }}>{renderMonthlyStats()}</View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <CategoryList
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        {expenses.length > 0 ? (
          <ExpenseList
            expenses={expenses}
            onExpensePress={(expense) => {
              navigation.navigate("ExpenseDetails", { expenseId: expense.id });
            }}
            onSeeAllPress={() => {
              navigation.navigate("AllExpenses");
            }}
          />
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
      <FooterTab navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 24,
    textAlign: "center",
  },
  addExpenseButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addExpenseText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
