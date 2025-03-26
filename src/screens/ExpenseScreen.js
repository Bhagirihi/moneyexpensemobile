import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FooterTab from "../components/FooterTab";
import { Header } from "../components/Header";
import { CategoryList } from "../components/CategoryList";
import ExpenseList from "../components/ExpenseList";
import { expenseService } from "../services/expenseService";
import { showToast } from "../utils/toast";

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
  const [error, setError] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({
    totalExpenses: 0,
    totalBudget: 2000.0,
    remainingBalance: 2000.0,
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const calculateMonthlyStats = (expensesData) => {
    const totalExpenses = expensesData.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    setMonthlyStats({
      totalExpenses,
      totalBudget: 2000.0,
      remainingBalance: 2000.0 - totalExpenses,
    });
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory]);

  const fetchExpenses = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching expenses...");
      const { data, hasMore: more } = await expenseService.getExpenses(
        selectedCategory === 0 ? null : categories[selectedCategory].name,
        pageNum,
        10
      );
      console.log("Fetched expenses:", data);

      if (!data || data.length === 0) {
        setExpenses([]);
        calculateMonthlyStats([]);
        setHasMore(false);
        setPage(1);
        return;
      }

      const newExpenses = pageNum === 1 ? data : [...expenses, ...data];
      setExpenses(newExpenses);
      calculateMonthlyStats(newExpenses);
      setHasMore(more);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching expenses:", error.message);
      setError("Failed to fetch expenses. Please try again later.");
      showToast.error("Failed to fetch expenses", "Please try again later");
      setExpenses([]);
      calculateMonthlyStats([]);
      setHasMore(false);
      setPage(1);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchExpenses(page + 1);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchExpenses(1);
  };

  const handleExpensePress = (expense) => {
    navigation.navigate("ExpenseDetails", { expense });
  };

  const handleDeletePress = async (expenseId) => {
    try {
      await expenseService.deleteExpense(expenseId);
      const updatedExpenses = expenses.filter(
        (expense) => expense.id !== expenseId
      );
      setExpenses(updatedExpenses);
      calculateMonthlyStats(updatedExpenses);
      showToast.success(
        "Expense deleted",
        "The expense has been successfully deleted"
      );
    } catch (error) {
      console.error("Error deleting expense:", error);
      showToast.error("Failed to delete expense", "Please try again later");
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
        <View style={[styles.statsItem]}>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
            Remaining
          </Text>
          <View style={{ flexDirection: "column", alignItems: "left" }}>
            <Text style={[styles.statsValue, { color: theme.success }]}>
              ₹{monthlyStats.remainingBalance.toFixed(2)}
            </Text>
            <Text
              style={[
                styles.statsValue,
                { color: theme.success, fontSize: 14 },
              ]}
            >
              {`${Math.round(
                (monthlyStats.totalExpenses / monthlyStats.totalBudget) * 100
              )}%`}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={48}
        color={theme.error}
      />
      <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: theme.primary }]}
        onPress={() => fetchExpenses(1)}
      >
        <Text style={[styles.retryButtonText, { color: theme.white }]}>
          Retry
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
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
      />
      <View style={{ marginTop: 10 }}>{renderMonthlyStats()}</View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
          />
        }
      >
        <CategoryList
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          showLabel={true}
        />

        {error ? (
          renderErrorState()
        ) : (
          <ExpenseList
            expenses={expenses}
            onExpensePress={handleExpensePress}
            onDeletePress={handleDeletePress}
            onSeeAllPress={() => navigation.navigate("AllExpenses")}
            showHeader={true}
            showEmptyState={true}
            showAllButton={false}
            navigation={navigation}
            title="Transactions"
          />
        )}
      </ScrollView>
      <FooterTab navigation={navigation} activeRoute="Expense" />
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
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginBottom: 10,
    padding: 8,
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
  },
  statsItem: {
    flex: 1,
    alignItems: "center",
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
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 24,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
