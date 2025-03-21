import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "./src/context/ThemeContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";

import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { VerificationScreen } from "./src/screens/VerificationScreen";

// Import all screens
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { ExpenseScreen } from "./src/screens/ExpenseScreen";
import { AddExpenseScreen } from "./src/screens/AddExpenseScreen";
import { ExpenseBoardScreen } from "./src/screens/ExpenseBoardScreen";
import { ExpenseBoardDetailsScreen } from "./src/screens/ExpenseBoardDetailsScreen";
import { CreateExpenseBoardScreen } from "./src/screens/CreateExpenseBoardScreen";
import { CategoriesScreen } from "./src/screens/CategoriesScreen";
import { AddCategoryScreen } from "./src/screens/AddCategoryScreen";
import { AnalyticsScreen } from "./src/screens/AnalyticsScreen";
import { AnalysisScreen } from "./src/screens/AnalysisScreen";
import { NotificationScreen } from "./src/screens/NotificationScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";

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

const Navigation = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!user ? (
        // Auth Stack
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="Verification" component={VerificationScreen} />
        </>
      ) : (
        // App Stack
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Expense" component={ExpenseScreen} />
          <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
          <Stack.Screen name="ExpenseBoard" component={ExpenseBoardScreen} />
          <Stack.Screen
            name="ExpenseBoardDetails"
            component={ExpenseBoardDetailsScreen}
          />
          <Stack.Screen
            name="CreateExpenseBoard"
            component={CreateExpenseBoardScreen}
          />
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="AddCategory" component={AddCategoryScreen} />
          <Stack.Screen name="Analytics" component={AnalyticsScreen} />
          <Stack.Screen name="Analysis" component={AnalysisScreen} />
          <Stack.Screen name="Notification" component={NotificationScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <NavigationContainer>
            <Navigation />
          </NavigationContainer>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
