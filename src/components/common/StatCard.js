import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import Card from "./Card";

const StatCard = memo(
  ({
    title,
    value,
    icon,
    trend,
    trendType = "neutral",
    style,
    titleStyle,
    valueStyle,
    trendStyle,
    ...props
  }) => {
    const { theme } = useTheme();

    const styles = useMemo(
      () =>
        StyleSheet.create({
          container: {
            ...style,
          },
          header: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          },
          iconContainer: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: `${theme.primary}20`,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          },
          title: {
            fontSize: 14,
            fontWeight: "500",
            color: theme.textSecondary,
            ...titleStyle,
          },
          value: {
            fontSize: 24,
            fontWeight: "600",
            color: theme.text,
            marginBottom: 4,
            ...valueStyle,
          },
          trendContainer: {
            flexDirection: "row",
            alignItems: "center",
          },
          trendIcon: {
            marginRight: 4,
          },
          trendText: {
            fontSize: 14,
            fontWeight: "500",
            color:
              trendType === "positive"
                ? theme.success
                : trendType === "negative"
                ? theme.error
                : theme.textSecondary,
            ...trendStyle,
          },
        }),
      [theme, trendType]
    );

    const getTrendIcon = () => {
      switch (trendType) {
        case "positive":
          return "trending-up";
        case "negative":
          return "trending-down";
        default:
          return "trending-neutral";
      }
    };

    return (
      <Card style={styles.container} {...props}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={theme.primary}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.value}>{value}</Text>
        {trend && (
          <View style={styles.trendContainer}>
            <MaterialCommunityIcons
              name={getTrendIcon()}
              size={16}
              color={styles.trendText.color}
              style={styles.trendIcon}
            />
            <Text style={styles.trendText}>{trend}</Text>
          </View>
        )}
      </Card>
    );
  }
);

export default StatCard;
