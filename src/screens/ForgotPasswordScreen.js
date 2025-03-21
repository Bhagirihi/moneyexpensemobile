import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ForgotPasswordScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError("Email is required");
      return false;
    } else if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return false;
    }
    return true;
  };

  const handleResetPassword = () => {
    if (validateForm()) {
      // Implement password reset logic here
      console.log("Password reset attempted for:", email);
      Alert.alert(
        "Reset Link Sent",
        "Please check your email for password reset instructions",
        [{ text: "OK" }]
      );
    } else {
      Alert.alert("Validation Error", "Please enter a valid email address", [
        { text: "OK" },
      ]);
    }
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

      {/* Header Text */}
      <Text style={[styles.title, { color: theme.text }]}>Reset Password</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        enter your email to reset password
      </Text>

      {/* Input Field */}
      <View style={styles.inputContainer}>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.secondary,
              borderColor: error ? theme.error || "#ff0000" : "transparent",
              borderWidth: error ? 1 : 0,
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Enter your email"
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) {
                setError("");
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
        {error ? (
          <Text style={[styles.errorText, { color: theme.error || "#ff0000" }]}>
            {error}
          </Text>
        ) : null}
      </View>

      {/* Reset Button */}
      <TouchableOpacity
        style={[styles.resetButton, { backgroundColor: theme.primary }]}
        onPress={handleResetPassword}
      >
        <Text style={[styles.resetButtonText, { color: theme.background }]}>
          Reset Password
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={theme.background}
        />
      </TouchableOpacity>

      {/* Back to Login */}
      <View style={styles.backContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.textSecondary}
          />
          <Text style={[styles.backText, { color: theme.textSecondary }]}>
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 32,
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
  resetButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    borderRadius: 12,
    marginBottom: 24,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  backContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  backText: {
    fontSize: 16,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default ForgotPasswordScreen;
