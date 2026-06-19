import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import FooterTab from "./FooterTab";

/**
 * Standard screen shell: top safe area + optional header + flex content + optional footer tab.
 * Footer sits above the system navigation bar (home indicator / gesture bar).
 */
export function ScreenLayout({
  children,
  header = null,
  navigation,
  footerRoute = null,
  style,
  contentStyle,
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }, style]}>
      <SafeAreaView style={styles.safeTop} edges={["top", "left", "right"]}>
        {header}
        <View style={[styles.content, contentStyle]}>{children}</View>
      </SafeAreaView>
      {footerRoute ? (
        <FooterTab navigation={navigation} activeRoute={footerRoute} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeTop: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default ScreenLayout;
