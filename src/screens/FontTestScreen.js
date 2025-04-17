import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components/Header";
import Font from "expo-font";

const FontTestScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Load fonts
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          Inter_Regular: require("../../assets/fonts/Inter_Regular.ttf"),
          Inter_Medium: require("../../assets/fonts/Inter_Medium.ttf"),
          Inter_Bold: require("../../assets/fonts/Inter_Bold.ttf"),
          "Manrope-Medium": require("../../assets/fonts/Manrope-Medium.ttf"),
          "Manrope-Bold": require("../../assets/fonts/Manrope-Bold.ttf"),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error("Error loading fonts:", error);
      }
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Font Test" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content}>
        {/* Body Text */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Body Text (Inter Regular)
          </Text>
          <Text style={[styles.bodyText, { color: theme.text }]}>
            This is regular body text using Inter Regular. It should be easy to
            read and comfortable for long paragraphs.
          </Text>
        </View>

        {/* Numbers */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Numbers (Inter Regular)
          </Text>
          <View style={styles.numberGrid}>
            <Text style={[styles.numberText, { color: theme.text }]}>
              1234567890
            </Text>
            <Text style={[styles.numberText, { color: theme.text }]}>
              $1,234.56
            </Text>
            <Text style={[styles.numberText, { color: theme.text }]}>
              99.99%
            </Text>
          </View>
        </View>

        {/* Headings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Headings (Inter Medium)
          </Text>
          <Text style={[styles.headingText, { color: theme.text }]}>
            Section Title
          </Text>
          <Text style={[styles.subheadingText, { color: theme.text }]}>
            Subsection Title
          </Text>
        </View>

        {/* Monospace */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Monospace (Inter Regular)
          </Text>
          <Text style={[styles.monospaceText, { color: theme.text }]}>
            Date: 2024-03-31 Amount: $123.45 Category: Food
          </Text>
        </View>

        {/* Bold Text */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Bold Text (Inter Bold)
          </Text>
          <Text style={[styles.boldText, { color: theme.text }]}>
            This is bold text for emphasis and important information.
          </Text>
        </View>

        {/* Manrope Fonts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Manrope Fonts
          </Text>
          <Text style={[styles.manropeMedium, { color: theme.text }]}>
            This is Manrope Medium - great for UI elements
          </Text>
          <Text style={[styles.manropeBold, { color: theme.text }]}>
            This is Manrope Bold - perfect for buttons and CTAs
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    fontFamily: "Inter_Medium",
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Inter_Regular",
  },
  numberGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  numberText: {
    fontSize: 18,
    fontFamily: "Inter_Regular",
    letterSpacing: 0.5,
  },
  headingText: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    fontFamily: "Inter_Medium",
  },
  subheadingText: {
    fontSize: 20,
    fontWeight: "500",
    fontFamily: "Inter_Medium",
  },
  monospaceText: {
    fontSize: 16,
    fontFamily: "Inter_Regular",
    lineHeight: 24,
  },
  boldText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_Bold",
  },
  manropeMedium: {
    fontSize: 16,
    fontFamily: "Manrope-Medium",
    marginBottom: 8,
  },
  manropeBold: {
    fontSize: 16,
    fontFamily: "Manrope-Bold",
  },
});

export default FontTestScreen;
