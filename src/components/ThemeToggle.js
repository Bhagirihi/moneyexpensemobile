import React from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
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
      <View
        style={[
          styles.toggle,
          {
            backgroundColor: theme.primary,
            transform: [
              {
                translateX: isDarkMode ? 22 : 0,
              },
            ],
          },
        ]}
      >
        {/* Sun/Moon icon */}
        <View style={styles.iconContainer}>
          {isDarkMode ? (
            <View style={[styles.moon, { backgroundColor: "#FFFFFF" }]} />
          ) : (
            <View style={[styles.sun, { backgroundColor: "#FFFFFF" }]} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  toggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 14,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  sun: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  moon: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default ThemeToggle;
