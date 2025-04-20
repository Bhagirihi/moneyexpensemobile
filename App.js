import React, { useEffect, useState, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { AuthProvider } from "./src/context/AuthContext";
import { supabase } from "./src/config/supabase";
import Toast from "react-native-toast-message";
import { AppSettingsProvider } from "./src/context/AppSettingsContext";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
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
import { View } from "react-native";
import { showToast } from "./src/utils/toast";

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

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();

        await Font.loadAsync({
          Inter_Bold: require("./assets/fonts/Inter_Bold.ttf"),
          Inter_Medium: require("./assets/fonts/Inter_Medium.ttf"),
          Inter_Regular: require("./assets/fonts/Inter_Regular.ttf"),
          "Manrope-Bold": require("./assets/fonts/Manrope-Bold.ttf"),
          "Manrope-Medium": require("./assets/fonts/Manrope-Medium.ttf"),
        });

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          showToast.error("Error", "User session not found.");
          return;
        }

        console.log("session updated_at:", session.user.updated_at);

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

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
        });

        return () => subscription.unsubscribe();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true); // Ready to render
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return <View style={{ flex: 1, backgroundColor: "#f3f2ef" }} />;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <StatusBar
        barStyle={
          theme.background === "#FFFFFF" ? "dark-content" : "light-content"
        }
        backgroundColor={theme.background}
      />
      <AuthProvider>
        <ThemeProvider>
          <AppSettingsProvider>
            <NavigationContainer>
              <Stack.Navigator screenOptions={screenOptions}>
                {session ? (
                  // Protected routes
                  <>
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
