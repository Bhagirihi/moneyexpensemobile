import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode ? theme.cardBackground : theme.secondary,
        },
      ]}
      activeOpacity={0.8}
      onPress={toggleTheme}
    >
      <MaterialCommunityIcons
        name={isDarkMode ? "white-balance-sunny" : "moon-waning-crescent"}
        size={20}
        color={isDarkMode ? "#FFD700" : "#2C3E50"}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});

export default ThemeToggle;
