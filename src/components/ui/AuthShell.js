import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { layout, radii, spacing, typography } from "../../theme/tokens";

export function AuthShell({
  title,
  subtitle,
  children,
  footer = null,
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, spacing.lg) + spacing.xl;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBand}
      />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        >
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.brandBlock}>
              <View
                style={[
                  styles.logoWrap,
                  { backgroundColor: theme.white },
                ]}
              >
                <Image
                  source={require("../../../assets/logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.title, { color: theme.white }]}>{title}</Text>
              {subtitle ? (
                <Text style={[styles.subtitle, { color: "rgba(255,255,255,0.85)" }]}>
                  {subtitle}
                </Text>
              ) : null}
            </View>

            <View
              style={[
                styles.card,
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
    height: 280,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
  },
  scroll: {
    flexGrow: 1,
  },
  inCardFooter: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  brandBlock: {
    alignItems: "center",
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: layout.screenPadding,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  logo: { width: 52, height: 52 },
  title: { ...typography.h1, textAlign: "center" },
  subtitle: {
    ...typography.body,
    textAlign: "center",
    marginTop: spacing.sm,
    maxWidth: 280,
  },
  card: {
    marginHorizontal: layout.screenPadding,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: { elevation: 4 },
    }),
  },
});

export default AuthShell;
