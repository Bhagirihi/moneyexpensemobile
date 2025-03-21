import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { signOut } from "../config/supabase";

const HomeScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Welcome</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {user?.email}
      </Text>

      <TouchableOpacity
        style={[styles.signOutButton, { backgroundColor: theme.primary }]}
        onPress={handleSignOut}
      >
        <Text style={[styles.signOutText, { color: theme.background }]}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  signOutButton: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HomeScreen;
