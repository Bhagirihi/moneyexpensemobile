import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { formatCurrency } from "../utils/formatters";
import { sendExpenseDeletedNotification } from "../services/pushNotificationService";

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

const ExpenseItem = memo(({ expense, onPress, onDelete }) => {
  const { theme } = useTheme();

  const handleDelete = () => {
    // Pass the expense data to the parent component
    onDelete(expense);
  };

  // Memoize styles
  const styles = useMemo(
    () =>
      StyleSheet.create({
        expenseItem: {
          flexDirection: "row",
          alignItems: "center",
          padding: Platform.OS == "ios" ? 16 : 12,
          borderRadius: 16,
          marginBottom: Platform.OS == "ios" ? 12 : 8,
          backgroundColor: theme.card,
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
          backgroundColor: `${expense.color}20`,
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
          color: theme.text,
        },
        expenseAmount: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.text,
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
          color: theme.textSecondary,
        },
        expenseCreator: {
          fontSize: 13,
          opacity: 0.7,
          color: theme.textSecondary,
        },
        deleteButton: {
          padding: 8,
          marginLeft: 8,
        },
      }),
    [theme, expense.color]
  );

  return (
    <TouchableOpacity style={styles.expenseItem} onPress={onPress}>
      <View style={styles.expenseIcon}>
        <MaterialCommunityIcons
          name={expense.icon}
          size={20}
          color={expense.color}
        />
      </View>
      <View style={styles.expenseInfo}>
        <View style={styles.expenseHeader}>
          <Text style={styles.expenseName}>
            {typeof expense.category === "string"
              ? expense.category
              : expense.category?.name || "Uncategorized"}
          </Text>
          <Text style={styles.expenseAmount}>
            {formatCurrency(expense.amount)}
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
            <Text style={styles.expenseCreator}>
              {expense?.created_by_profile?.full_name || "Unknown"}
            </Text>
          </View>

          <View style={styles.expenseMeta}>
            <MaterialCommunityIcons
              name="calendar-outline"
              size={14}
              color={theme.textSecondary}
              style={styles.metaIcon}
            />
            <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
          </View>
        </View>
        <View
          style={[
            styles.expenseMeta,
            { marginVertical: 5, justifyContent: "space-between" },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              name="view-grid"
              size={14}
              color={theme.textSecondary}
              style={styles.metaIcon}
            />
            <Text style={styles.expenseCreator}>
              {expense?.board || "Unknown"}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="view-grid"
              size={14}
              color={theme.textSecondary}
              style={styles.metaIcon}
            />
            <Text style={styles.expenseCreator}>
              {expense?.payment_method || "Unknown"}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialCommunityIcons
          name="delete-outline"
          size={20}
          color={theme.error}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

export default ExpenseItem;
