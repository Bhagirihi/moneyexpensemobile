import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
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
    <SafeAreaView
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
      <View style={styles.titleSection}>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          ellipsizeMode="middle"
          style={[styles.title, { color: theme.text }, titleStyle]}
        >
          {title}
        </Text>
      </View>

      <View style={styles.rightSection}>{renderRightSection()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: Platform.OS == "ios" ? "auto" : "10%",
    marginTop: Platform.OS == "ios" ? null : 10,
    borderBottomWidth: 1,
  },
  leftSection: {
    width: "15%",
    alignItems: "center",
  },
  rightSection: {
    Width: "15%",
    alignItems: "center",
  },
  titleSection: {
    width: "70%",
    alignItems: "center",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    width: "60%",
  },
});
