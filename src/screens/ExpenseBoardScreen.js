import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components/Header";

export const ExpenseBoardScreen = ({ navigation }) => {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header title="Expense Board" onBack={() => navigation.goBack()} />
      <View style={styles.content}>{/* Content will be added here */}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
