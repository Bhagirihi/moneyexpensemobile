import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { layout, radii, spacing, typography } from "../../theme/tokens";
import BrandLogo from "../BrandLogo";

const COMPACT_HEIGHT = 760;

export function AuthShell({
  title,
  subtitle,
  children,
  footer = null,
  testID,
  compact: compactProp,
  showSubtitle = true,
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const compact = compactProp ?? windowHeight < COMPACT_HEIGHT;
  const logoSize = compact ? 52 : 64;
  const heroHeight = compact ? 148 : 232;

  const bottomPad = Math.max(insets.bottom, spacing.sm) + (compact ? spacing.md : spacing.lg);

  const brandBlock = useMemo(() => {
    if (compact) {
      return (
        <View style={styles.brandRow}>
          <BrandLogo size={logoSize} transparent style={styles.logoShadow} />
          <View style={styles.brandTextCol}>
            <Text style={[styles.brandNameCompact, { color: theme.white }]}>Trivense</Text>
            <Text style={[styles.titleCompact, { color: theme.white }]}>{title}</Text>
            {showSubtitle && subtitle ? (
              <Text
                style={[styles.subtitleCompact, { color: "rgba(255,255,255,0.8)" }]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
      );
    }

    return (
      <>
        <BrandLogo size={logoSize} transparent style={styles.logoShadow} />
        <Text style={[styles.brandName, { color: theme.white }]}>Trivense</Text>
        <Text style={[styles.title, { color: theme.white }]}>{title}</Text>
        {showSubtitle && subtitle ? (
          <Text style={[styles.subtitle, { color: "rgba(255,255,255,0.85)" }]}>
            {subtitle}
          </Text>
        ) : null}
      </>
    );
  }, [compact, logoSize, theme, title, subtitle, showSubtitle]);

  return (
    <View
      testID={testID}
      style={[styles.root, { backgroundColor: theme.background }]}
    >
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroBand, { height: heroHeight }]}
      />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 8 : 0}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              compact && styles.scrollCompact,
              { paddingBottom: bottomPad },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View
              style={[
                styles.brandBlock,
                compact ? styles.brandBlockCompact : styles.brandBlockDefault,
              ]}
            >
              {brandBlock}
            </View>

            <View
              style={[
                styles.card,
                compact && styles.cardCompact,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              {children}
              {footer ? (
                <View
                  style={[
                    styles.inCardFooter,
                    compact && styles.inCardFooterCompact,
                    { borderTopColor: theme.border },
                  ]}
                >
                  {footer}
                </View>
              ) : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  safe: { flex: 1 },
  heroBand: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
  },
  scroll: {
    flexGrow: 1,
  },
  scrollCompact: {
    paddingTop: spacing.xs,
  },
  inCardFooter: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inCardFooterCompact: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  brandBlock: {
    paddingHorizontal: layout.screenPadding,
  },
  brandBlockDefault: {
    alignItems: "center",
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  brandBlockCompact: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  brandTextCol: {
    flex: 1,
    minWidth: 0,
  },
  logoShadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  brandName: {
    ...typography.h3,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  brandNameCompact: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  title: { ...typography.h1, textAlign: "center" },
  titleCompact: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 26,
    marginTop: 2,
  },
  subtitle: {
    ...typography.body,
    textAlign: "center",
    marginTop: spacing.xs,
    maxWidth: 280,
  },
  subtitleCompact: {
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.sm,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.07,
        shadowRadius: 16,
      },
      android: { elevation: 3 },
    }),
  },
  cardCompact: {
    padding: spacing.md,
    borderRadius: radii.lg,
  },
});

export default AuthShell;
