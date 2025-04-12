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
import { useAppSettings } from "../context/AppSettingsContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FooterTab from "../components/FooterTab";
import { Header } from "../components/Header";
import { CategoryList } from "../components/CategoryList";
import ExpenseList from "../components/ExpenseList";
import { expenseService } from "../services/expenseService";
import { showToast } from "../utils/toast";
import { formatCurrency } from "../utils/formatters";
import { realTimeSync } from "../services/realTimeSync";

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
    console.log("Selected category:", selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    fetchExpenses();
    const EnpenseRealTimeSync = realTimeSync.subscribeToExpense(fetchExpenses);
    return EnpenseRealTimeSync;
  }, []);

  const fetchExpenses = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching expenses...");
      console.log(`Fetching expenses of...`, selectedCategory);
      const { data, hasMore: more } = await expenseService.getExpenses(
        selectedCategory === 0 ? null : selectedCategory,
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
            {formatCurrency(monthlyStats.totalExpenses)}
          </Text>
        </View>
        <View style={[styles.statsItem]}>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
            Remaining
          </Text>
          <Text
            style={[
              styles.statsValue,
              {
                color:
                  monthlyStats.remainingBalance >= 0
                    ? theme.success
                    : theme.error,
              },
            ]}
          >
            {formatCurrency(monthlyStats.remainingBalance)}
          </Text>
        </View>
      </View>

      {/* Combined Progress Bar */}
      <View style={styles.combinedProgressContainer}>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
            Budget Usage
          </Text>
          <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
            {`${Math.round(
              (monthlyStats.totalExpenses / monthlyStats.totalBudget) * 100
            )}%`}
          </Text>
        </View>
        <View
          style={[
            styles.combinedProgressBar,
            { backgroundColor: theme.background },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.round(
                  (monthlyStats.totalExpenses / monthlyStats.totalBudget) * 100
                )}%`,
                backgroundColor: theme.primary,
              },
            ]}
          />
          <View
            style={[
              styles.remainingFill,
              {
                width: `100%`,
                backgroundColor: theme.success,
              },
            ]}
          />
        </View>
        <View style={styles.progressLegend}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: theme.primary }]}
            />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>
              Used
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: theme.success }]}
            />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>
              Remaining
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
    padding: 16,
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
    alignItems: "center",
    marginBottom: 16,
  },
  statsItem: {
    flex: 1,
    alignItems: "center",
  },
  statsLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  combinedProgressContainer: {
    width: "100%",
    marginTop: 8,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  combinedProgressBar: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    flexDirection: "row",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  remainingFill: {
    height: "100%",
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  progressLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500",
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
