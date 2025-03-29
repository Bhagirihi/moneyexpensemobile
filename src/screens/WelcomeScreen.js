import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import BalloonIllustration from "../components/BalloonIllustration";
import { supabase } from "../config/supabase";

const { width } = Dimensions.get("window");

const WelcomeScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const slideUpAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if it's first launch and user login state
    checkFirstLaunchAndAuth();
  }, []);

  const checkFirstLaunchAndAuth = async () => {
    try {
      // Check if user is logged in
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      // // Check if it's first launch
      // const hasLaunched = await AsyncStorage.getItem("hasLaunched");

      // if (hasLaunched === null) {
      //   // First time launching the app
      //   await AsyncStorage.setItem("hasLaunched", "true");
      setTimeout(() => {
        if (user) {
          navigation.replace("Dashboard");
        } else {
          navigation.replace("Login");
        }
      }, 2500);
      // } else {
      //   // Not first launch
      //   setTimeout(() => {
      //     if (user) {
      //       navigation.replace("Dashboard");
      //     } else {
      //       navigation.replace("Login");
      //     }
      //   }, 2500);
      // }
    } catch (error) {
      console.error("Error checking auth state:", error);
      // In case of error, default to Login
      setTimeout(() => {
        navigation.replace("Login");
      }, 2500);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.primary }]}
    >
      <StatusBar barStyle="light-content" />
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideUpAnim }],
          },
        ]}
      >
        <View style={styles.illustrationContainer}>
          <BalloonIllustration
            width={width * 0.6}
            height={width * 0.6}
            color="#FFFFFF"
          />
          <Animated.Text
            style={[
              styles.exploreText,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}
          >
            TripExpanse
          </Animated.Text>
          <Animated.Text
            style={[
              styles.subtitleText,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}
          >
            Track your travel expenses with ease
          </Animated.Text>
        </View>
      </Animated.View>
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
    paddingTop: 40,
  },
  exploreText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 20,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    marginTop: 8,
    textAlign: "center",
  },
  bottomContainer: {
    width: "100%",
    paddingHorizontal: 20,
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
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default WelcomeScreen;
