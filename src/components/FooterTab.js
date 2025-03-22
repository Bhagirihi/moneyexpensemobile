import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const FooterTab = ({ navigation, activeRoute = "Home" }) => {
  const { theme } = useTheme();

  const getTabColor = (tabName) => {
    return activeRoute === tabName ? theme.primary : theme.textSecondary;
  };

  const getTextColor = (tabName) => {
    return activeRoute === tabName ? theme.primary : theme.textSecondary;
  };

  const getTabStyle = (tabName) => {
    return [
      styles.tabItem,
      activeRoute === tabName && [
        styles.activeTabItem,
        { backgroundColor: `${theme.primary}15` },
      ],
    ];
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.card }]}>
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        <TouchableOpacity
          style={getTabStyle("Home")}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <View style={styles.tabContent}>
            <MaterialCommunityIcons
              name="home"
              size={24}
              color={getTabColor("Home")}
            />
            <Text style={[styles.tabText, { color: getTextColor("Home") }]}>
              Home
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={getTabStyle("Analytics")}
          onPress={() => navigation.navigate("Analytics")}
        >
          <View style={styles.tabContent}>
            <MaterialCommunityIcons
              name="chart-bar"
              size={24}
              color={getTabColor("Analytics")}
            />
            <Text
              style={[styles.tabText, { color: getTextColor("Analytics") }]}
            >
              Analytics
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={getTabStyle("Settings")}
          onPress={() => navigation.navigate("Settings")}
        >
          <View style={styles.tabContent}>
            <MaterialCommunityIcons
              name="cog"
              size={24}
              color={getTabColor("Settings")}
            />
            <Text style={[styles.tabText, { color: getTextColor("Settings") }]}>
              Settings
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeTabItem: {
    borderRadius: 20,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});

export default FooterTab;
