import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "../hooks/useTranslation";
import { useSubscription } from "../context/SubscriptionContext";
import { radii, spacing, typography } from "../theme/tokens";

const DISMISS_KEY = "@trivense/ad_supported_banner_dismissed";

export default function AdSupportedAccessBanner() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { paymentsEnabled, isPaidSubscriber, loading } = useSubscription();
  const [dismissed, setDismissed] = useState(true);

  const loadDismissed = useCallback(async () => {
    const raw = await AsyncStorage.getItem(DISMISS_KEY);
    setDismissed(raw === "1");
  }, []);

  useEffect(() => {
    loadDismissed();
  }, [loadDismissed, paymentsEnabled]);

  const handleDismiss = async () => {
    setDismissed(true);
    await AsyncStorage.setItem(DISMISS_KEY, "1");
  };

  if (loading || paymentsEnabled || isPaidSubscriber || dismissed) {
    return null;
  }

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: theme.primaryMuted, borderColor: theme.border },
      ]}
    >
      <MaterialCommunityIcons name="information-outline" size={20} color={theme.primary} />
      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.text }]}>
          {t("adSupportedAccessTitle")}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t("adSupportedAccessBody")}
        </Text>
      </View>
      <TouchableOpacity onPress={handleDismiss} hitSlop={8} accessibilityLabel={t("dismiss")}>
        <MaterialCommunityIcons name="close" size={20} color={theme.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  body: {
    flex: 1,
  },
  title: {
    ...typography.label,
    fontWeight: "700",
    marginBottom: 2,
  },
  subtitle: {
    ...typography.caption,
    lineHeight: 18,
  },
});
