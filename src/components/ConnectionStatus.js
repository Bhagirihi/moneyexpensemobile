import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { checkSupabaseConnection } from "../config/supabase";
import { useTheme } from "../context/ThemeContext";

// Default colors in case theme is not available
const defaultColors = {
  primary: "#007AFF",
  success: "#34C759",
  error: "#FF3B30",
  text: "#000000",
};

export const ConnectionStatus = () => {
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState(null);
  const { theme } = useTheme() || { theme: { colors: defaultColors } };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await checkSupabaseConnection();
        setStatus(result.status);
        setError(result.error);
      } catch (err) {
        setStatus("error");
        setError(err.message);
      }
    };

    checkConnection();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return theme?.colors?.success || defaultColors.success;
      case "error":
        return theme?.colors?.error || defaultColors.error;
      default:
        return theme?.colors?.text || defaultColors.text;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "Connected to Supabase";
      case "error":
        return "Connection Error";
      default:
        return "Checking Connection...";
    }
  };

  return (
    <View style={styles.container}>
      {status === "checking" ? (
        <ActivityIndicator
          size="small"
          color={theme?.colors?.primary || defaultColors.primary}
        />
      ) : (
        <View style={styles.statusContainer}>
          <View
            style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
          />
          <Text
            style={[
              styles.statusText,
              { color: theme?.colors?.text || defaultColors.text },
            ]}
          >
            {getStatusText()}
          </Text>
        </View>
      )}
      {error && (
        <Text
          style={[
            styles.errorText,
            { color: theme?.colors?.error || defaultColors.error },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
});
