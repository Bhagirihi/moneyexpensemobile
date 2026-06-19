import React from "react";
import { TouchableOpacity, StyleSheet, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { radii } from "../theme/tokens";

const ThemeToggle = ({ compact = false }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <TouchableOpacity
        style={[
          styles.container,
          compact && styles.compact,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
        activeOpacity={0.8}
        onPress={toggleTheme}
      >
        <MaterialCommunityIcons
          name={isDarkMode ? "white-balance-sunny" : "moon-waning-crescent"}
          size={compact ? 18 : 20}
          color={isDarkMode ? theme.warning : theme.primary}
        />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  compact: { width: 36, height: 36 },
});

export default ThemeToggle;
