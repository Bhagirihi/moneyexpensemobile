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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { signUpWithEmail } from "../config/supabase";

const RegisterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Mobile validation
    const mobileRegex = /^[0-9]{10}$/;
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!mobileRegex.test(formData.mobile)) {
      newErrors.mobile = "Invalid mobile number (10 digits)";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (
      !/(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(formData.password)
    ) {
      newErrors.password =
        "Password must contain uppercase, number, and special character";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms validation
    if (!agreeToTerms) {
      newErrors.terms = "Please agree to Terms & Conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        const { data, error } = await signUpWithEmail(
          formData.email,
          formData.password,
          {
            full_name: formData.name,
            mobile: formData.mobile,
          }
        );

        if (error) {
          Alert.alert("Registration Error", error.message);
          return;
        }

        // Navigate to verification screen
        navigation.navigate("Verification", {
          email: formData.email,
          mobile: formData.mobile,
        });
      } catch (error) {
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert("Validation Error", "Please fix the errors in the form");
    }
  };

  const handleGoogleSignUp = () => {
    // Implement Google sign up logic
    console.log("Google sign up attempted");
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
        <Text style={[styles.title, { color: theme.text }]}>
          Create Account
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          sign up to get started
        </Text>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <View>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.secondary,
                  borderColor: errors.name
                    ? theme.error || "#ff0000"
                    : "transparent",
                  borderWidth: errors.name ? 1 : 0,
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Full Name"
                placeholderTextColor={theme.textSecondary}
                value={formData.name}
                onChangeText={(text) => {
                  setFormData({ ...formData, name: text });
                  if (errors.name) {
                    setErrors({ ...errors, name: null });
                  }
                }}
                autoCapitalize="words"
              />
              <MaterialCommunityIcons
                name="account-outline"
                size={24}
                color={theme.textSecondary}
              />
            </View>
            {renderError("name")}
          </View>

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
                  borderColor: errors.mobile
                    ? theme.error || "#ff0000"
                    : "transparent",
                  borderWidth: errors.mobile ? 1 : 0,
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Mobile Number"
                placeholderTextColor={theme.textSecondary}
                value={formData.mobile}
                onChangeText={(text) => {
                  setFormData({ ...formData, mobile: text });
                  if (errors.mobile) {
                    setErrors({ ...errors, mobile: null });
                  }
                }}
                keyboardType="phone-pad"
                maxLength={10}
              />
              <MaterialCommunityIcons
                name="phone-outline"
                size={24}
                color={theme.textSecondary}
              />
            </View>
            {renderError("mobile")}
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

          <View>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.secondary,
                  borderColor: errors.confirmPassword
                    ? theme.error || "#ff0000"
                    : "transparent",
                  borderWidth: errors.confirmPassword ? 1 : 0,
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Confirm Password"
                placeholderTextColor={theme.textSecondary}
                value={formData.confirmPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, confirmPassword: text });
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: null });
                  }
                }}
                secureTextEntry
              />
              <MaterialCommunityIcons
                name="lock-check-outline"
                size={24}
                color={theme.textSecondary}
              />
            </View>
            {renderError("confirmPassword")}
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.optionsContainer}>
          <Pressable
            style={styles.rememberContainer}
            onPress={() => {
              setAgreeToTerms(!agreeToTerms);
              if (errors.terms) {
                setErrors({ ...errors, terms: null });
              }
            }}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: errors.terms
                    ? theme.error || "#ff0000"
                    : theme.textSecondary,
                  backgroundColor: agreeToTerms ? theme.primary : "transparent",
                },
              ]}
            >
              {agreeToTerms && (
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={theme.background}
                />
              )}
            </View>
            <Text style={[styles.rememberText, { color: theme.textSecondary }]}>
              I agree to the Terms & Conditions
            </Text>
          </Pressable>
          {renderError("terms")}
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 },
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <>
              <Text
                style={[styles.nextButtonText, { color: theme.background }]}
              >
                Create Account
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.background}
              />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (formData.email && formData.mobile) {
              navigation.navigate("Verification", {
                email: formData.email,
                mobile: formData.mobile,
              });
            } else {
              Alert.alert(
                "Missing Information",
                "Please enter your email and mobile number first",
                [{ text: "OK" }]
              );
            }
          }}
          style={styles.verificationTextContainer}
        >
          <Text
            style={[styles.verificationText, { color: theme.textSecondary }]}
          >
            After signing up, you'll need to verify your email and mobile number
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={16}
            color={theme.textSecondary}
            style={styles.verificationIcon}
          />
        </TouchableOpacity>

        {/* Google Sign Up Button */}
        <TouchableOpacity
          style={[styles.googleButton, { backgroundColor: theme.secondary }]}
          onPress={handleGoogleSignUp}
        >
          <MaterialCommunityIcons
            name="google"
            size={24}
            color={theme.text}
            style={styles.googleIcon}
          />
          <Text style={[styles.googleButtonText, { color: theme.text }]}>
            Sign up with Google
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: theme.textSecondary }]}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={[styles.loginLink, { color: theme.primary }]}>
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  illustrationContainer: {
    height: 100,
    marginTop: 20,
    marginBottom: 16,
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
    top: 8,
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 28,
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
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  optionsContainer: {
    marginBottom: 28,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  nextButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 52,
    borderRadius: 12,
    marginBottom: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  googleButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 52,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 8,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  verificationText: {
    fontSize: 13,
    textAlign: "center",
    fontStyle: "italic",
    flex: 1,
  },
  verificationTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  verificationIcon: {
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default RegisterScreen;
