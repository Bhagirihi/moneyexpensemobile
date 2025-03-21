import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components/Header";

export const ExpenseBoardDetailsScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { boardName } = route.params || { boardName: "Board Details" };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header title={boardName} onBack={() => navigation.goBack()} />
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
