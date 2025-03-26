import React, { memo, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ExpenseItem from "./ExpenseItem";

const ExpenseList = memo(
  ({
    expenses,
    onExpensePress,
    title,
    showAllButton = true,
    onDeletePress,
    onSeeAllPress,
    showHeader = true,
    showEmptyState = true,
    navigation,
  }) => {
    const { theme } = useTheme();

    // Memoize the renderItem callback
    const renderItem = useCallback(
      ({ item }) => (
        <ExpenseItem
          expense={item}
          onPress={() => onExpensePress(item)}
          onDelete={() => onDeletePress(item.id)}
        />
      ),
      [onExpensePress, onDeletePress]
    );

    // Memoize the keyExtractor callback
    const keyExtractor = useCallback((item) => item.id.toString(), []);

    // Memoize the styles
    const styles = useMemo(
      () =>
        StyleSheet.create({
          container: {
            flex: 1,
            backgroundColor: theme.background,
          },
          list: {
            flex: 1,
          },
          header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: theme.background,
          },
          headerTitle: {
            fontSize: 18,
            fontWeight: "600",
            color: theme.text,
            opacity: 0.8,
            marginBottom: 8,
          },
          seeAllButton: {
            padding: 8,
          },
          seeAllText: {
            color: theme.primary,
            fontSize: 16,
            fontWeight: "500",
          },
          emptyContainer: {
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            backgroundColor: theme.cardBackground,
            borderRadius: 16,
            marginHorizontal: 20,
            marginVertical: 10,
          },
          emptyText: {
            fontSize: 16,
            marginTop: 12,
            textAlign: "center",
            color: theme.textSecondary,
          },
          createButton: {
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            borderRadius: 12,
            marginTop: 16,
            backgroundColor: theme.primary,
          },
          createButtonText: {
            fontSize: 14,
            fontWeight: "600",
            marginLeft: 8,
            color: theme.white,
          },
        }),
      [
        theme.background,
        theme.text,
        theme.primary,
        theme.textSecondary,
        theme.card,
        theme.white,
      ]
    );

    const renderHeader = () => {
      if (!showHeader) return null;

      return (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {title ? title : "Transactions"}
          </Text>
          {showAllButton && expenses.length > 0 && (
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={onSeeAllPress}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    };

    const renderEmptyState = () => {
      if (!showEmptyState) return null;

      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="receipt"
            size={48}
            color={theme.textSecondary}
          />
          <Text style={styles.emptyText}>No transactions found</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate("AddExpense")}
          >
            <MaterialCommunityIcons name="plus" size={24} color={theme.white} />
            <Text style={styles.createButtonText}>Add Transaction</Text>
          </TouchableOpacity>
        </View>
      );
    };

    return (
      <View style={styles.container}>
        {renderHeader()}

        <FlatList
          data={expenses}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          style={styles.list}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    );
  }
);

export default ExpenseList;
