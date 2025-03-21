import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const formatDate = (date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const expenseDate = new Date(date);

  if (expenseDate.toDateString() === today.toDateString()) {
    return "Today";
  } else if (expenseDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return expenseDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
};

export const ExpenseList = ({
  expenses,
  onExpensePress,
  onSeeAllPress,
  showHeader = true,
  title = "Expenses",
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.recentExpenses}>
      {showHeader && (
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {title}
            </Text>
            <Text style={[styles.expenseCount, { color: theme.textSecondary }]}>
              {expenses.length}{" "}
              {expenses.length === 1 ? "transaction" : "transactions"}
            </Text>
          </View>
          <TouchableOpacity onPress={onSeeAllPress} style={styles.seeAllButton}>
            <Text style={[styles.seeAll, { color: theme.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {expenses.map((expense) => (
        <TouchableOpacity
          key={expense.id}
          style={[styles.expenseItem, { backgroundColor: theme.card }]}
          onPress={() => onExpensePress?.(expense)}
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
            <View style={styles.expenseHeader}>
              <Text style={[styles.expenseName, { color: theme.text }]}>
                {expense.category}
              </Text>
              <Text style={[styles.expenseAmount, { color: theme.text }]}>
                ${expense.amount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.expenseDetails}>
              <View style={styles.expenseMeta}>
                <MaterialCommunityIcons
                  name="account-circle-outline"
                  size={14}
                  color={theme.textSecondary}
                  style={styles.metaIcon}
                />
                <Text
                  style={[
                    styles.expenseCreator,
                    { color: theme.textSecondary },
                  ]}
                >
                  {expense.createdBy || "Unknown"}
                </Text>
              </View>
              <View style={styles.expenseMeta}>
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={14}
                  color={theme.textSecondary}
                  style={styles.metaIcon}
                />
                <Text
                  style={[styles.expenseDate, { color: theme.textSecondary }]}
                >
                  {formatDate(expense.date)}
                </Text>
              </View>
            </View>
          </View>
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
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  expenseCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  seeAllButton: {
    padding: 8,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "500",
  },
  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  expenseInfo: {
    flex: 1,
    marginLeft: 16,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: "600",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  expenseDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  expenseMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    marginRight: 4,
  },
  expenseDate: {
    fontSize: 13,
    opacity: 0.7,
  },
  expenseCreator: {
    fontSize: 13,
    opacity: 0.7,
  },
});
