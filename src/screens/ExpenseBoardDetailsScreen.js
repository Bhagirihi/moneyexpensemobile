import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components/Header";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ExpenseList } from "../components/ExpenseList";

const { width } = Dimensions.get("window");

// Dummy data for expenses
const expenses = [
  {
    id: 1,
    category: "Food & Drinks",
    amount: 120,
    date: new Date(),
    icon: "food",
    color: "#FF6B6B",
  },
  {
    id: 2,
    category: "Shopping",
    amount: 50,
    date: new Date(),
    icon: "shopping",
    color: "#4ECDC4",
  },
  {
    id: 3,
    category: "Housing",
    amount: 250,
    date: new Date(Date.now() - 86400000), // Yesterday
    icon: "home",
    color: "#6C5CE7",
  },
  {
    id: 4,
    category: "Transportation",
    amount: 80,
    date: new Date(Date.now() - 86400000), // Yesterday
    icon: "car",
    color: "#45B7D1",
  },
];

// Calculate total expenses
const totalExpenses = expenses.reduce(
  (sum, expense) => sum + expense.amount,
  0
);

export const ExpenseBoardDetailsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { boardName } = route.params;

  const renderSummaryCard = () => (
    <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Total Expenses
          </Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            ${totalExpenses}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Shared With
          </Text>
          <View style={styles.sharedUsersContainer}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: "#FF6B6B" }]}>
                <Text style={styles.avatarText}>JD</Text>
              </View>
              <View style={[styles.avatar, { backgroundColor: "#4ECDC4" }]}>
                <Text style={styles.avatarText}>AS</Text>
              </View>
              <View style={[styles.avatar, { backgroundColor: "#6C5CE7" }]}>
                <Text style={styles.avatarText}>MK</Text>
              </View>
            </View>
            <Text style={[styles.sharedCount, { color: theme.text }]}>+2</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title={boardName}
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            onPress={() => navigation.navigate("AddExpense")}
            style={styles.addButton}
          >
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color={theme.primary}
            />
          </TouchableOpacity>
        }
      />

      {renderSummaryCard()}
      <ExpenseList expenses={expenses} showHeader={true} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  addButton: {
    padding: 8,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "600",
  },
  sharedUsersContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    flexDirection: "row",
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -8,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  sharedCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
});
