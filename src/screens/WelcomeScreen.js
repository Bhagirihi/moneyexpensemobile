import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../config/supabase";

const { width, height } = Dimensions.get("window");

const WelcomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
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
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      setTimeout(() => {
        if (user) {
          navigation.replace("Dashboard");
        } else {
          navigation.replace("Login");
        }
      }, 2500);
    } catch (error) {
      console.error("Error checking auth state:", error);
      setTimeout(() => {
        navigation.replace("Login");
      }, 2500);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#F3F2EF" }]}>
      <StatusBar barStyle="dark-content" />
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
          <Image
            source={require("../../assets/welcome.png")}
            resizeMode="cover"
            resizeMethod="auto"
            style={styles.logo}
          />
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: width,
    height: height * 0.6,
  },
});

export default WelcomeScreen;
