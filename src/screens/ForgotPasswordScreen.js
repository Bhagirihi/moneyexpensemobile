import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../config/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { showToast } from "../utils/toast";

const ForgotPasswordScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        formData.email.trim(),
        {
          redirectTo: "yourapp://reset-password",
        }
      );

      if (error) throw error;
      showToast(
        "Password reset instructions have been sent to your email",
        "success"
      );
      navigation.navigate("Login");
    } catch (error) {
      console.error("Reset password error:", error.message);
      showToast(error.message || "Failed to send reset instructions", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="lock-reset"
              size={64}
              color={theme.primary}
            />
            <Text style={[styles.title, { color: theme.text }]}>
              Reset Password
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Enter your email to receive reset instructions
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Email</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.card,
                    borderColor: errors.email ? theme.error : theme.border,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color={theme.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData((prev) => ({ ...prev, email: text }));
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && (
                <Text style={[styles.errorText, { color: theme.error }]}>
                  {errors.email}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: theme.primary }]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.white} />
              ) : (
                <Text style={[styles.resetButtonText, { color: theme.white }]}>
                  Send Reset Instructions
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.backContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                style={styles.backButton}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={20}
                  color={theme.textSecondary}
                />
                <Text style={[styles.backText, { color: theme.textSecondary }]}>
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  resetButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  backContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  backText: {
    fontSize: 14,
    marginLeft: 8,
  },
});

export default ForgotPasswordScreen;
