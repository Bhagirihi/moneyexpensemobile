import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { BRAND_NAME } from "../../config/brand";
import { PlanBadge } from "./PlanBadge";
import { spacing, typography } from "../../theme/tokens";

export const AppTabHeader = memo(
  ({
    title,
    subtitle,
    eyebrow,
    leading,
    trailing,
    compact = false,
    onTitlePress,
    onPlanPress,
    testID,
  }) => {
    const { theme } = useTheme();
    const trailingNode = trailing ?? <PlanBadge onPress={onPlanPress} />;

    const titleContent = (
      <Text
        style={[
          styles.title,
          compact && styles.titleCompact,
          { color: theme.text },
          leading ? styles.titleWithLeading : null,
        ]}
        numberOfLines={2}
      >
        {title}
      </Text>
    );

    return (
      <View style={styles.wrap} testID={testID}>
        <View style={styles.topRow}>
          <Text style={[styles.brand, { color: theme.primary }]}>
            {BRAND_NAME.toUpperCase()}
          </Text>
          {trailingNode}
        </View>

        {eyebrow ? (
          <Text style={[styles.eyebrow, { color: theme.primary }]}>{eyebrow}</Text>
        ) : null}

        <View style={styles.titleRow}>
          {leading ? <View style={styles.leading}>{leading}</View> : null}
          {onTitlePress ? (
            <TouchableOpacity
              onPress={onTitlePress}
              activeOpacity={0.8}
              style={styles.titlePressable}
            >
              {titleContent}
            </TouchableOpacity>
          ) : (
            titleContent
          )}
        </View>

        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              compact && styles.subtitleCompact,
              { color: theme.textSecondary },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  brand: {
    ...typography.micro,
    letterSpacing: 2,
  },
  eyebrow: {
    ...typography.micro,
    marginTop: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  leading: {
    marginTop: spacing.xs,
  },
  titlePressable: {
    flex: 1,
  },
  title: {
    ...typography.h1,
    flex: 1,
  },
  titleWithLeading: {
    marginTop: 0,
  },
  titleCompact: {
    fontSize: 24,
    lineHeight: 28,
    marginTop: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  subtitleCompact: {
    marginTop: spacing.xs,
    marginBottom: 0,
    fontSize: 13,
    lineHeight: 18,
  },
});
