import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export const ExpenseList = ({ expenses, onExpensePress, onSeeAllPress }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.recentExpenses}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Recent Expenses
        </Text>
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
        </TouchableOpacity>
      </View>
      {expenses.map((expense) => (
        <TouchableOpacity
          key={expense.id}
          style={[styles.expenseItem, { backgroundColor: theme.card }]}
          onPress={() => onExpensePress(expense)}
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
};

const styles = StyleSheet.create({
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
});
