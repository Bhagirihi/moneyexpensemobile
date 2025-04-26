import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Image,
  Text,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../config/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
        if (!user) {
          navigation.replace("Login");
        }
        // else {
        //   navigation.replace("Dashboard");
        // }
      }, 3000);
    } catch (error) {
      console.log("Error checking auth state:", error);
      setTimeout(() => {
        navigation.replace("Login");
      }, 2500);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.white }]}>
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
            source={require("../../assets/icon.png")}
            resizeMode="contain"
            resizeMethod="auto"
            style={[styles.logo]}
            tintColor={theme.primary}
          />

          <Text
            style={{
              fontSize: 72,
              fontFamily: "Poppins-Bold",
              fontWeight: "bold",
              color: theme.primary,
            }}
          >
            Trivense
          </Text>
          <Text
            style={{
              fontSize: 26,
              includeFontPadding: true,
              fontFamily: "Poppines-Medium",
              fontWeight: "300",
              color: theme.primary,
            }}
          >
            Split Smarter. Travel Lighter
          </Text>
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
    // padding: 20,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 360,
    height: 240,
  },
});

export default WelcomeScreen;
