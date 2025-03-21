import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const FooterTab = ({ navigation }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate("Dashboard")}
      >
        <MaterialCommunityIcons name="home" size={24} color={theme.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate("Trips")}
      >
        <MaterialCommunityIcons
          name="airplane"
          size={24}
          color={theme.textSecondary}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate("Expenses")}
      >
        <MaterialCommunityIcons
          name="wallet"
          size={24}
          color={theme.textSecondary}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate("Profile")}
      >
        <MaterialCommunityIcons
          name="account"
          size={24}
          color={theme.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  tabItem: {
    padding: 8,
  },
});

export default FooterTab;
