import React, { memo, useCallback, useMemo } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import ExpenseItem from "./ExpenseItem";

const ExpenseList = memo(({ expenses, onExpensePress, onDeletePress }) => {
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
      }),
    [theme.background]
  );

  return (
    <View style={styles.container}>
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
});

export default ExpenseList;
