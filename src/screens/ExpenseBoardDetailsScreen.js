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
import { expenseBoardService } from "../services/expenseBoardService";
import { expenseService } from "../services/expenseService";
import { showToast } from "../utils/toast";
import { useNavigation, useRoute } from "@react-navigation/native";
import { formatCurrency } from "../utils/formatters";
import ExpenseItem from "../components/ExpenseItem";

export const ExpenseBoardDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { boardId, boardName, totalExpenses, totalBudget, totalTransactions } =
    route.params;
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [expenses, setExpenses] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch recent transactions
      const { data: transactionsData } =
        await expenseService.getExpensesbyBoardId(boardId, null, 1, 4);
      console.log("Fetched recent transactions: BOARD --", transactionsData);
      // Update expenses state with fetched transactions
      setExpenses(transactionsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Error loading data", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [boardId]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleDeleteBoard = async () => {
    try {
      await expenseBoardService.deleteExpenseBoard(boardId);
      showToast.success("Expense board deleted successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting board:", error);
      showToast.error("Failed to delete expense board");
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
        Start adding expenses to track your spending
      </Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate("AddExpense", { boardId })}
      >
        <MaterialCommunityIcons name="plus" size={20} color={theme.white} />
        <Text style={[styles.addButtonText, { color: theme.white }]}>
          Add First Transaction
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

  const remainingBudget = totalBudget - totalExpenses;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title={boardName}
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
                {formatCurrency(totalExpenses)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Budget
              </Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {formatCurrency(totalBudget)}
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
                    color: remainingBudget >= 0 ? theme.success : theme.error,
                  },
                ]}
              >
                {formatCurrency(remainingBudget)}
              </Text>
            </View>
          </View>

          {expenses.length > 0 ? (
            <View>
              <Text style={styles.headerTitle}>Transactions</Text>
              <View>
                {expenses.map((expense) => (
                  <ExpenseItem
                    key={expense.id}
                    expense={expense}
                    onPress={() =>
                      navigation.navigate("ExpenseDetails", {
                        expenseId: expense.id,
                      })
                    }
                    onDelete={() => {
                      // Handle delete if needed
                      console.log("Delete expense:", expense.id);
                    }}
                  />
                ))}
              </View>
            </View>
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
          Add Transaction
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    //   color: theme.text,
    opacity: 0.8,
    marginBottom: 8,
    marginTop: 16,
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
  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: "#666",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
});
