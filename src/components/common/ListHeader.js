import React, { memo, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";

const ListHeader = memo(
  ({
    title,
    subtitle,
    action,
    actionText,
    style,
    titleStyle,
    subtitleStyle,
    actionStyle,
    actionTextStyle,
    ...props
  }) => {
    const { theme } = useTheme();

    const styles = useMemo(
      () =>
        StyleSheet.create({
          container: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            ...style,
          },
          titleContainer: {
            flex: 1,
          },
          title: {
            fontSize: 20,
            fontWeight: "600",
            color: theme.text,
            marginBottom: 4,
            ...titleStyle,
          },
          subtitle: {
            fontSize: 14,
            color: theme.textSecondary,
            ...subtitleStyle,
          },
          action: {
            padding: 8,
            ...actionStyle,
          },
          actionText: {
            fontSize: 14,
            fontWeight: "500",
            color: theme.primary,
            ...actionTextStyle,
          },
        }),
      [theme]
    );

    return (
      <View style={styles.container} {...props}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {action && (
          <TouchableOpacity style={styles.action} onPress={action}>
            <Text style={styles.actionText}>{actionText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

export default ListHeader;
