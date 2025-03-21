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

const { width } = Dimensions.get("window");

// Dummy data for expense boards
const expenseBoards = [
  {
    id: 1,
    name: "General",
    icon: "view-grid",
    color: "#6C5CE7",
    totalExpenses: 2500,
    budget: 5000,
    totalTransactions: 12,
  },
  {
    id: 2,
    name: "GOA",
    icon: "beach",
    color: "#FF6B6B",
    totalExpenses: 1500,
    budget: 3000,
    totalTransactions: 8,
  },
  {
    id: 3,
    name: "DAMAN",
    icon: "city",
    color: "#4ECDC4",
    totalExpenses: 800,
    budget: 2000,
    totalTransactions: 5,
  },
  {
    id: 4,
    name: "MUMBAI",
    icon: "city-variant",
    color: "#45B7D1",
    totalExpenses: 1200,
    budget: 4000,
    totalTransactions: 7,
  },
  {
    id: 5,
    name: "DELHI",
    icon: "city-variant-outline",
    color: "#96CEB4",
    totalExpenses: 900,
    budget: 2500,
    totalTransactions: 6,
  },
];

export const ExpenseBoardScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const renderExpenseBoard = (board) => (
    <TouchableOpacity
      key={board.id}
      style={[styles.boardCard, { backgroundColor: theme.card }]}
      onPress={() =>
        navigation.navigate("ExpenseBoardDetails", { boardName: board.name })
      }
    >
      <View style={styles.boardHeader}>
        <View
          style={[styles.boardIcon, { backgroundColor: `${board.color}15` }]}
        >
          <MaterialCommunityIcons
            name={board.icon}
            size={24}
            color={board.color}
          />
        </View>
        <Text style={[styles.boardName, { color: theme.text }]}>
          {board.name}
        </Text>
      </View>
      <View style={styles.boardStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Total Expenses
          </Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            ${board.totalExpenses}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Budget
          </Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            ${board.budget}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Transactions
          </Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {board.totalTransactions}
          </Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor:
                  board.totalExpenses > board.budget
                    ? theme.error
                    : theme.success,
                width: `${Math.min(
                  (board.totalExpenses / board.budget) * 100,
                  100
                )}%`,
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title="Expense Board"
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            onPress={() => navigation.navigate("CreateExpenseBoard")}
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {expenseBoards.map(renderExpenseBoard)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  addButton: {
    padding: 8,
  },
  boardCard: {
    padding: 16,
    borderRadius: 16,
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
  boardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  boardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  boardName: {
    fontSize: 18,
    fontWeight: "600",
  },
  boardStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
});
