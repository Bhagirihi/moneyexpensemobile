import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import BalloonIllustration from "../components/BalloonIllustration";

const WelcomeScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem("hasLaunched");

      if (hasLaunched === null) {
        // First time launching the app
        await AsyncStorage.setItem("hasLaunched", "true");
        setTimeout(() => {
          navigation.replace("Onboarding");
        }, 2000);
      } else {
        // Not first launch, go directly to Login
        setTimeout(() => {
          navigation.replace("Login");
        }, 2000);
      }
    } catch (error) {
      console.error("Error checking first launch:", error);
      // In case of error, default to Login
      setTimeout(() => {
        navigation.replace("Login");
      }, 2000);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.primary }]}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <BalloonIllustration width={200} height={200} color="#FFFFFF" />
          <Text style={styles.exploreText}>Explore</Text>
        </View>

        <TouchableOpacity
          style={[styles.themeButton, { backgroundColor: theme.accent }]}
          onPress={toggleTheme}
        >
          <Text style={styles.buttonText}>
            Switch to {isDarkMode ? "Light" : "Dark"} Mode
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 40,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  exploreText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 20,
  },
  themeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default WelcomeScreen;
