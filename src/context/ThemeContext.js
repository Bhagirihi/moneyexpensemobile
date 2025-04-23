import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Backup of the current theme
const currentTheme = {
  primary: "#6C63FF",
  secondary: "#4CAF50",
  background: "#FFFFFF",
  card: "#F5F5F5",
  text: "#333333",
  textSecondary: "#666666",
  border: "#E0E0E0",
  error: "#FF3B30",
  success: "#34C759",
  warning: "#FF9500",
  white: "#FFFFFF",
  overlay: "rgba(0, 0, 0, 0.5)",
  shadow: {
    color: "#000",
    opacity: 0.1,
    radius: 4,
    elevation: 2,
  },
};

// New professional light theme
const lightTheme = {
  primary: "#31356e", // Modern, trustworthy blue

  secondary: "#6366F1", // Indigo for secondary actions
  background: "#FFFFFF", // Pure white for clean look
  card: "#F8FAFC", // Very light gray for cards
  cardBackground: "#FFFFFF", // White background for cards
  text: "#1E293B", // Dark slate for primary text
  textSecondary: "#64748B", // Medium gray for secondary text
  border: "#E2E8F0", // Light gray for borders
  error: "#EF4444", // Red for errors
  success: "#10B981", // Green for success
  warning: "#F59E0B", // Amber for warnings
  white: "#FFFFFF", // Pure white
  overlay: "rgba(0, 0, 0, 0.5)", // Semi-transparent black for overlays
  shadow: {
    color: "#000",
    opacity: 0.1,
    radius: 4,
    elevation: 2,
  },
  // Additional colors for SettingsScreen
  errorLight: "#FEE2E2", // Light red for error backgrounds
  primaryLight: "#DBEAFE", // Light blue for primary backgrounds
  textLight: "#94A3B8", // Light text color
  borderLight: "#E2E8F0", // Light border color
  inputBackground: "#F8FAFC", // Light gray for input backgrounds
};

const darkTheme = {
  primary: "#31356e",
  secondary: "#6366F1",
  background: "#0F172A",
  card: "#1E293B",
  cardBackground: "#1E293B", // Dark background for cards
  text: "#F8FAFC",
  textSecondary: "#CBD5E1",
  border: "#334155",
  error: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
  white: "#FFFFFF",
  overlay: "rgba(0, 0, 0, 0.7)",
  shadow: {
    color: "#000",
    opacity: 0.3,
    radius: 4,
    elevation: 2,
  },
  // Additional colors for SettingsScreen
  errorLight: "#7F1D1D", // Dark red for error backgrounds
  primaryLight: "#1E40AF", // Dark blue for primary backgrounds
  textLight: "#64748B", // Dark text color
  borderLight: "#334155", // Dark border color
  inputBackground: "#1E293B", // Dark gray for input backgrounds
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === "dark");
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem("theme", newTheme ? "dark" : "light");
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
