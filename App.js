import React, { useEffect, useState, useCallback } from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { AuthProvider } from "./src/context/AuthContext";
import { supabase } from "./src/config/supabase";
import Toast from "react-native-toast-message";
import { AppSettingsProvider } from "./src/context/AppSettingsContext";
// import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { Asset } from "expo-asset";

import { StatusBar } from "expo-status-bar";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import EmailVerificationScreen from "./src/screens/EmailVerificationScreen";
import FontTestScreen from "./src/screens/FontTestScreen";

// Import all screens

import { DashboardScreen } from "./src/screens/DashboardScreen";
import { ExpenseScreen } from "./src/screens/ExpenseScreen";
import { AddExpenseScreen } from "./src/screens/AddExpenseScreen";
import { ExpenseBoardScreen } from "./src/screens/ExpenseBoardScreen";
import { ExpenseBoardDetailsScreen } from "./src/screens/ExpenseBoardDetailsScreen";
import { CreateExpenseBoardScreen } from "./src/screens/CreateExpenseBoardScreen";
import { CategoriesScreen } from "./src/screens/CategoriesScreen";
import { AnalyticsScreen } from "./src/screens/AnalyticsScreen";
import { AnalysisScreen } from "./src/screens/AnalysisScreen";
import { NotificationScreen } from "./src/screens/NotificationScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { InvitationsScreen } from "./src/screens/InvitationsScreen";
import { AddCategoryScreen } from "./src/screens/AddCategoryScreen";
import * as SplashScreen from "expo-splash-screen";

import { showToast } from "./src/utils/toast";
import {
  handleBackgroundNotifications,
  handleForegroundNotifications,
  registerForPushNotificationsAsync,
} from "./src/services/pushNotificationService";
import { useColorScheme } from "react-native";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

// Initialize native stack navigator
const Stack = createNativeStackNavigator();

const config = {
  animation: "spring",
  config: {
    stiffness: 1000,
    damping: 50,
    mass: 3,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

const screenOptions = {
  headerShown: false,
  cardStyle: { backgroundColor: "transparent" },
  cardOverlayEnabled: true,
  cardStyleInterpolator: ({ current: { progress } }) => ({
    cardStyle: {
      opacity: progress.interpolate({
        inputRange: [0, 0.5, 0.9, 1],
        outputRange: [0, 0.25, 0.7, 1],
      }),
      transform: [
        {
          scale: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1],
          }),
        },
      ],
    },
    overlayStyle: {
      opacity: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
  }),
  transitionSpec: {
    open: config,
    close: config,
  },
};

const AppContent = () => {
  const { theme } = useTheme();
  const [session, setSession] = useState(null);
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded] = Font.useFonts({
    "Poppins-Regular": require("./assets/fonts/Poppins-Regular.ttf"),
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Session is ==> onAuthStateChange", session);
      setSession(session);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        //  await SplashScreen.preventAutoHideAsync();
        await Asset.loadAsync([require("./assets/icon.png")]);
        await Font.loadAsync({
          Inter_Bold: require("./assets/fonts/Inter_Bold.ttf"),
          Inter_Medium: require("./assets/fonts/Inter_Medium.ttf"),
          Inter_Regular: require("./assets/fonts/Inter_Regular.ttf"),
          "Manrope-Bold": require("./assets/fonts/Manrope-Bold.ttf"),
          "Manrope-Medium": require("./assets/fonts/Manrope-Medium.ttf"),

          "Poppins-Bold": require("./assets/fonts/Poppins-Bold.ttf"),
          "Poppins-Medium": require("./assets/fonts/Poppins-Medium.ttf"),
          "Poppins-Light": require("./assets/fonts/Poppins-Light.ttf"),
          "Poppins-ExtraLight": require("./assets/fonts/Poppins-ExtraLight.ttf"),
          "Poppins-Regular": require("./assets/fonts/Poppins-Regular.ttf"),
          "Poppins-SemiBold": require("./assets/fonts/Poppins-SemiBold.ttf"),
          "Poppins-Thin": require("./assets/fonts/Poppins-Thin.ttf"),
          "Poppins-ExtraBold": require("./assets/fonts/Poppins-ExtraBold.ttf"),
        });

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          showToast.error("Error", "User session not found.");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .update({ updated_at: new Date().toISOString() }) // Optionally use new Date()
          .eq("id", session.user.id)
          .select("updated_at") // So you get the updated value
          .single();

        if (error) {
          showToast.error("Update failed", error.message);
        } else {
          showToast.success("Updated at", data?.updated_at);
        }

        setSession(session);
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true); // Ready to render
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    // Register for push notifications when the app is loaded
    registerForPushNotificationsAsync();

    // Handle foreground notifications
    handleForegroundNotifications();

    // Handle background notifications
    handleBackgroundNotifications();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      SplashScreen.hide();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }
  console.log("theme.background", theme.background);

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      {/* <StatusBar
        barStyle={
          theme.background === "#FFFFFF" ? "dark-content" : "light-content"
        }
        backgroundColor={theme.background}
      /> */}
      <AuthProvider>
        <ThemeProvider>
          <AppSettingsProvider>
            <NavigationContainer>
              <Stack.Navigator
                screenOptions={screenOptions}
                initialRouteName={
                  !session
                    ? "Login"
                    : session?.user?.email_confirmed_at
                    ? "Dashboard"
                    : "EmailVerification"
                }
              >
                {session ? (
                  // Protected routes (unverified users see EmailVerification first)
                  <>
                    <Stack.Screen
                      name="EmailVerification"
                      component={EmailVerificationScreen}
                    />
                    {/* <Stack.Screen name="Welcome" component={WelcomeScreen} /> */}
                    <Stack.Screen
                      name="Dashboard"
                      component={DashboardScreen}
                    />
                    <Stack.Screen name="Expense" component={ExpenseScreen} />
                    <Stack.Screen
                      name="AddExpense"
                      component={AddExpenseScreen}
                    />
                    <Stack.Screen
                      name="ExpenseBoard"
                      component={ExpenseBoardScreen}
                    />
                    <Stack.Screen
                      name="ExpenseBoardDetails"
                      component={ExpenseBoardDetailsScreen}
                    />
                    <Stack.Screen
                      name="CreateExpenseBoard"
                      component={CreateExpenseBoardScreen}
                    />
                    <Stack.Screen
                      name="Categories"
                      component={CategoriesScreen}
                    />
                    <Stack.Screen
                      name="AddCategory"
                      component={AddCategoryScreen}
                    />
                    <Stack.Screen
                      name="Analytics"
                      component={AnalyticsScreen}
                    />
                    <Stack.Screen name="Analysis" component={AnalysisScreen} />
                    <Stack.Screen
                      name="Notification"
                      component={NotificationScreen}
                    />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen name="Settings" component={SettingsScreen} />
                    <Stack.Screen
                      name="Profile2"
                      component={InvitationsScreen}
                    />
                    <Stack.Screen name="FontTest" component={FontTestScreen} />
                  </>
                ) : (
                  // Public routes
                  <>
                    {/* <Stack.Screen name="Welcome" component={WelcomeScreen} /> */}
                    {/* <Stack.Screen
                      name="Onboarding"
                      component={OnboardingScreen}
                    /> */}
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                    <Stack.Screen
                      name="EmailVerification"
                      component={EmailVerificationScreen}
                    />
                    {/* EmailVerification in both stacks: public (e.g. after login "Email not confirmed") and protected (unverified session) */}
                    <Stack.Screen
                      name="ForgotPassword"
                      component={ForgotPasswordScreen}
                    />
                  </>
                )}
              </Stack.Navigator>
              <Toast />
            </NavigationContainer>
          </AppSettingsProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppSettingsProvider>
          <AppContent />
        </AppSettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
