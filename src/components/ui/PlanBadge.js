import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "../../hooks/useTranslation";
import { useSubscription } from "../../context/SubscriptionContext";
import { PLAN_CATALOG } from "../../config/subscriptionPlans";
import { radii } from "../../theme/tokens";

export const PlanBadge = memo(({ onPress }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { plan, isPremium } = useSubscription();
  const planName = t(PLAN_CATALOG[plan]?.nameKey || "planFree");

  const badge = (
    <View
      style={[
        styles.badge,
        isPremium
          ? { backgroundColor: theme.primary }
          : { backgroundColor: `${theme.textSecondary}20` },
      ]}
    >
      {isPremium ? (
        <MaterialCommunityIcons name="crown" size={12} color={theme.white} />
      ) : null}
      <Text
        style={[
          styles.text,
          { color: isPremium ? theme.white : theme.textSecondary },
        ]}
      >
        {planName}
      </Text>
    </View>
  );

  if (!onPress) return badge;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} hitSlop={8}>
      {badge}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
  },
});
