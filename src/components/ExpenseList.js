import React, { memo, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import ExpenseItem from "./ExpenseItem";

const ExpenseList = memo(
  ({
    expenses,
    onExpensePress,
    onDeletePress,
    onSeeAllPress,
    showHeader = true,
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
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: theme.background,
          },
          headerTitle: {
            fontSize: 18,
            fontWeight: "600",
            color: theme.text,
          },
          seeAllButton: {
            padding: 8,
          },
          seeAllText: {
            color: theme.primary,
            fontSize: 14,
            fontWeight: "500",
          },
        }),
      [theme.background, theme.text, theme.primary]
    );

    const renderHeader = () => {
      if (!showHeader) return null;

      return (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transactions</Text>
          <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAllPress}>
            <Text style={styles.seeAllText}>See All</Text>
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
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      </View>
    );
  }
);

export default ExpenseList;
