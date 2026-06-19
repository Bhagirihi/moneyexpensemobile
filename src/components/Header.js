import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { layout, radii, spacing, typography } from "../theme/tokens";

export const HEADER_MIN_HEIGHT = layout.headerHeight;

export const Header = ({
  title,
  onBack,
  rightComponent,
  showBack = true,
  titleStyle,
  containerStyle,
  variant = "default",
}) => {
  const { theme } = useTheme();
  const isLarge = variant === "large";

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.background,
          borderBottomColor: theme.border,
        },
        containerStyle,
      ]}
    >
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color={theme.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
      </View>

      <View style={styles.titleSection}>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            isLarge ? styles.titleLarge : styles.title,
            { color: theme.text },
            titleStyle,
          ]}
        >
          {title}
        </Text>
      </View>

      <View style={styles.rightSection}>{rightComponent || null}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: HEADER_MIN_HEIGHT,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "android" ? spacing.sm : spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftSection: { width: 48, alignItems: "flex-start", justifyContent: "center" },
  rightSection: {
    minWidth: 48,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: spacing.xs,
  },
  titleSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backPlaceholder: { width: 40, height: 40 },
  title: { ...typography.h3, textAlign: "center", width: "100%" },
  titleLarge: { ...typography.h2, textAlign: "center", width: "100%" },
});

export default Header;
