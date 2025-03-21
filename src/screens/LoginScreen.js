import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { signInWithEmail } from "../config/supabase";
import { ConnectionStatus } from "../components/ConnectionStatus";

const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        const { data, error } = await signInWithEmail(
          formData.email,
          formData.password
        );

        if (error) {
          Alert.alert("Login Error", error.message);
          return;
        }

        // Navigate to Home screen on successful login
        navigation.replace("Home");
      } catch (error) {
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert("Validation Error", "Please fix the errors in the form");
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Implement Google sign in logic here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
      console.log("Google sign in attempted");
    } catch (error) {
      Alert.alert("Error", "Failed to sign in with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const renderError = (field) => {
    if (errors[field]) {
      return (
        <Text style={[styles.errorText, { color: theme.error || "#ff0000" }]}>
          {errors[field]}
        </Text>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />

      {/* Mountain Illustration */}
      <View style={styles.illustrationContainer}>
        <View style={[styles.mountain, { backgroundColor: theme.primary }]} />
        <View style={styles.birds}>
          <Text style={{ color: theme.text }}>✢</Text>
          <Text style={{ color: theme.text }}>✢</Text>
        </View>
      </View>

      {/* Welcome Text */}
      <Text style={[styles.title, { color: theme.text }]}>Welcome back</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        sign in to access your account
      </Text>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <View>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.secondary,
                borderColor: errors.email
                  ? theme.error || "#ff0000"
                  : "transparent",
                borderWidth: errors.email ? 1 : 0,
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Enter your email"
              placeholderTextColor={theme.textSecondary}
              value={formData.email}
              onChangeText={(text) => {
                setFormData({ ...formData, email: text });
                if (errors.email) {
                  setErrors({ ...errors, email: null });
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <MaterialCommunityIcons
              name="email-outline"
              size={24}
              color={theme.textSecondary}
            />
          </View>
          {renderError("email")}
        </View>

        <View>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.secondary,
                borderColor: errors.password
                  ? theme.error || "#ff0000"
                  : "transparent",
                borderWidth: errors.password ? 1 : 0,
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              value={formData.password}
              onChangeText={(text) => {
                setFormData({ ...formData, password: text });
                if (errors.password) {
                  setErrors({ ...errors, password: null });
                }
              }}
              secureTextEntry
            />
            <MaterialCommunityIcons
              name="lock-outline"
              size={24}
              color={theme.textSecondary}
            />
          </View>
          {renderError("password")}
        </View>
      </View>

      {/* Remember Me & Forgot Password */}
      <View style={styles.optionsContainer}>
        <Pressable
          style={styles.rememberContainer}
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: theme.textSecondary,
                backgroundColor: rememberMe ? theme.primary : "transparent",
              },
            ]}
          >
            {rememberMe && (
              <MaterialCommunityIcons
                name="check"
                size={16}
                color={theme.background}
              />
            )}
          </View>
          <Text style={[styles.rememberText, { color: theme.textSecondary }]}>
            Remember me
          </Text>
        </Pressable>

        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={[styles.forgotPassword, { color: theme.primary }]}>
            Forgot password ?
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity
        style={[
          styles.nextButton,
          { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 },
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.background} />
        ) : (
          <>
            <Text style={[styles.nextButtonText, { color: theme.background }]}>
              Sign In
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.background}
            />
          </>
        )}
      </TouchableOpacity>

      {/* Google Sign In Button */}
      <TouchableOpacity
        style={[
          styles.googleButton,
          {
            backgroundColor: theme.secondary,
            opacity: googleLoading ? 0.7 : 1,
          },
        ]}
        onPress={handleGoogleSignIn}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <ActivityIndicator color={theme.text} />
        ) : (
          <>
            <MaterialCommunityIcons
              name="google"
              size={24}
              color={theme.text}
              style={styles.googleIcon}
            />
            <Text style={[styles.googleButtonText, { color: theme.text }]}>
              Sign in with Google
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Register Link */}
      <View style={styles.registerContainer}>
        <Text style={[styles.registerText, { color: theme.textSecondary }]}>
          New Member?{" "}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={[styles.registerLink, { color: theme.primary }]}>
            Register now
          </Text>
        </TouchableOpacity>
      </View>

      <ConnectionStatus />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  illustrationContainer: {
    height: 120,
    marginTop: 20,
    marginBottom: 20,
    position: "relative",
  },
  mountain: {
    width: 60,
    height: 60,
    borderRadius: 12,
    transform: [{ rotate: "45deg" }],
    position: "absolute",
    right: "40%",
  },
  birds: {
    flexDirection: "row",
    position: "absolute",
    right: "30%",
    top: 10,
    gap: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  rememberText: {
    fontSize: 14,
  },
  forgotPassword: {
    fontSize: 14,
  },
  nextButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    borderRadius: 12,
    marginBottom: 24,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  googleButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    borderRadius: 12,
    marginBottom: 24,
  },
  googleIcon: {
    marginRight: 8,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default LoginScreen;
