import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export const Header = ({
  title,
  onBack,
  rightComponent,
  showBack = true,
  titleStyle,
  containerStyle,
}) => {
  const { theme } = useTheme();

  const renderRightSection = () => {
    if (rightComponent) {
      return rightComponent;
    }
    return null;
  };

  return (
    <View
      style={[
        styles.header,
        { borderBottomColor: theme.border },
        containerStyle,
      ]}
    >
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name="arrow-left-circle"
              size={28}
              color={theme.text}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.title, { color: theme.text }, titleStyle]}>
        {title}
      </Text>

      <View style={styles.rightSection}>{renderRightSection()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leftSection: {
    width: "20%",
    alignItems: "flex-start",
  },
  rightSection: {
    Width: "20%",
    alignItems: "flex-end",
  },
  backButton: {
    padding: 4,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    width: "60%",
  },
});
