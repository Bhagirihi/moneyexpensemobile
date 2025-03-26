import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Header } from "../components/Header";
import { ExpenseList } from "../components/ExpenseList";
import { expenseBoardService } from "../services/expenseBoardService";
import { expenseService } from "../services/expenseService";
import { showToast } from "../utils/toast";

export const ExpenseBoardDetailsScreen = ({ route, navigation }) => {
  const { boardId } = route.params;
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [board, setBoard] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({
    totalExpenses: 0,
    totalBudget: 2000,
    remainingBalance: 2000,
  });

  useEffect(() => {
    fetchData();
  }, [boardId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [boardData, expensesData] = await Promise.all([
        expenseBoardService.getExpenseBoardById(boardId),
        expenseService.getExpenses(null, 1, 10),
      ]);

      if (!boardData) {
        showToast("Expense board not found", "error");
        navigation.goBack();
        return;
      }

      setBoard(boardData);
      setExpenses(expensesData.data);
      setMonthlyStats(await expenseService.getMonthlyStats());
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleDeleteBoard = async () => {
    try {
      await expenseBoardService.deleteExpenseBoard(boardId);
      showToast("Expense board deleted successfully", "success");
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting board:", error);
      showToast("Failed to delete expense board", "error");
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: `${theme.primary}15` },
        ]}
      >
        <MaterialCommunityIcons
          name="receipt-outline"
          size={40}
          color={theme.primary}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No Transactions Found
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Start adding your expenses to this board
      </Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate("AddExpense", { boardId })}
      >
        <MaterialCommunityIcons name="plus" size={20} color={theme.white} />
        <Text style={[styles.addButtonText, { color: theme.white }]}>
          Add Your First Transaction
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <Header title="Loading..." onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!board) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <Header title="Not Found" onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color={theme.error}
          />
          <Text style={[styles.errorText, { color: theme.text }]}>
            Expense board not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title={board.name}
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteBoard}
          >
            <MaterialCommunityIcons
              name="delete-outline"
              size={24}
              color={theme.error}
            />
          </TouchableOpacity>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Total Expenses
              </Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                ${monthlyStats.totalExpenses}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Budget
              </Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                ${monthlyStats.totalBudget}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Remaining
              </Text>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      monthlyStats.remainingBalance >= 0
                        ? theme.success
                        : theme.error,
                  },
                ]}
              >
                ${monthlyStats.remainingBalance}
              </Text>
            </View>
          </View>

          {expenses.length > 0 ? (
            <ExpenseList
              expenses={expenses}
              onExpensePress={(expense) => {
                console.log("Expense pressed:", expense);
              }}
              showHeader={false}
            />
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate("AddExpense", { boardId })}
      >
        <MaterialCommunityIcons name="plus" size={24} color={theme.white} />
        <Text style={[styles.addButtonText, { color: theme.white }]}>
          Add Expense
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  statsCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 8,
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: "center",
    opacity: 0.8,
  },
});
