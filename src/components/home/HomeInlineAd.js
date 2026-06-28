import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import InlineListAd from "../InlineListAd";
import { useAdPolicy } from "../../context/AdPolicyContext";
import { useSubscription } from "../../context/SubscriptionContext";

/**
 * Compact home ad slot — mirrors Rasoi SponsorOrAd placement on the dashboard.
 */
export const HomeInlineAd = memo(() => {
  const { showBannerAds } = useAdPolicy();
  const { isPremium } = useSubscription();

  if (!showBannerAds || isPremium) return null;

  return (
    <View style={styles.wrap}>
      <InlineListAd />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
  },
});
