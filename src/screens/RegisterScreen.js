import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { signUpWithEmail, signInWithGoogle } from "../config/supabase";
import { isValidEmail } from "../utils/validation";
import { showToast } from "../utils/toast";
import AuthShell from "../components/ui/AuthShell";
import FormButton from "../components/common/FormButton";
import { useTranslation } from "../hooks/useTranslation";
import { spacing, typography } from "../theme/tokens";

const RegisterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error: signUpError } = await signUpWithEmail(
        formData.email.trim(),
        formData.password,
        {
          full_name: formData.fullName.trim(),
          mobile: formData.mobile.trim(),
          phone_number: formData.mobile.trim(),
          avatar_url: null,
          has_notifications: false,
        }
      );

      if (signUpError) throw signUpError;

      navigation.reset({
        index: 0,
        routes: [
          {
            name: "EmailVerification",
            params: { email: formData.email.trim() },
          },
        ],
      });
    } catch (error) {
      console.error("Registration error:", error.message);
      showToast.error(error.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const { data, error } = await signInWithGoogle();
      if (error) throw error;
      if (data?.user?.email_confirmed_at) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Dashboard" }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "EmailVerification",
              params: { email: data?.user?.email },
            },
          ],
        });
      }
    } catch (error) {
      if (error?.message?.toLowerCase().includes("cancelled")) return;
      showToast.error(error?.message || "Google sign-up failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const renderField = (label, key, options = {}) => {
    const isSecure = options.secure;
    const visible = options.secureKey === "confirm" ? showConfirmPassword : showPassword;
    const toggleVisible =
      options.secureKey === "confirm"
        ? () => setShowConfirmPassword((v) => !v)
        : () => setShowPassword((v) => !v);

    return (
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        <View
          style={[
            styles.inputWrap,
            {
              backgroundColor: theme.inputBackground,
              borderColor: errors[key] ? theme.error : theme.border,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={options.icon}
            size={20}
            color={theme.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder={options.placeholder}
            placeholderTextColor={theme.textMuted}
            value={formData[key]}
            onChangeText={(text) => {
              setFormData((prev) => ({ ...prev, [key]: text }));
              if (errors[key]) {
                setErrors((prev) => ({ ...prev, [key]: undefined }));
              }
            }}
            secureTextEntry={isSecure && !visible}
            keyboardType={options.keyboard || "default"}
            autoCapitalize={options.autoCapitalize || "none"}
            maxLength={options.maxLength}
          />
          {isSecure ? (
            <TouchableOpacity onPress={toggleVisible} style={styles.eyeBtn}>
              <MaterialCommunityIcons
                name={visible ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={theme.textMuted}
              />
            </TouchableOpacity>
          ) : null}
        </View>
        {errors[key] ? (
          <Text style={[styles.error, { color: theme.error }]}>{errors[key]}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <AuthShell
      title="Create account"
      subtitle={t("brandTagline")}
      footer={
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={[styles.footerLink, { color: theme.primary }]}>Sign in</Text>
          </TouchableOpacity>
        </View>
      }
    >
      {renderField("Full name", "fullName", {
        icon: "account-outline",
        placeholder: "Your full name",
        autoCapitalize: "words",
      })}
      {renderField("Email", "email", {
        icon: "email-outline",
        placeholder: "you@example.com",
        keyboard: "email-address",
      })}
      {renderField("Mobile", "mobile", {
        icon: "phone-outline",
        placeholder: "10-digit mobile number",
        keyboard: "phone-pad",
        maxLength: 10,
      })}
      {renderField("Password", "password", {
        icon: "lock-outline",
        placeholder: "At least 8 characters",
        secure: true,
        secureKey: "password",
      })}
      {renderField("Confirm password", "confirmPassword", {
        icon: "lock-check-outline",
        placeholder: "Re-enter your password",
        secure: true,
        secureKey: "confirm",
      })}

      <FormButton
        title="Create account"
        onPress={handleRegister}
        loading={loading}
        size="large"
        style={styles.submitBtn}
      />

      <View style={styles.dividerRow}>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Text style={[styles.dividerText, { color: theme.textMuted }]}>or</Text>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
      </View>

      <TouchableOpacity
        style={[
          styles.googleBtn,
          { borderColor: theme.border, backgroundColor: theme.inputBackground },
        ]}
        onPress={handleGoogleSignUp}
        disabled={googleLoading}
        activeOpacity={0.85}
      >
        {googleLoading ? (
          <Text style={{ color: theme.text }}>...</Text>
        ) : (
          <>
            <MaterialCommunityIcons name="google" size={20} color="#4285F4" />
            <Text style={[styles.googleText, { color: theme.text }]}>
              Continue with Google
            </Text>
          </>
        )}
      </TouchableOpacity>
    </AuthShell>
  );
};

const styles = StyleSheet.create({
  field: { marginBottom: spacing.md },
  label: { ...typography.label, marginBottom: spacing.sm },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, fontSize: 16, paddingVertical: spacing.md },
  eyeBtn: { padding: spacing.sm },
  error: { fontSize: 12, marginTop: spacing.xs },
  submitBtn: { marginTop: spacing.sm },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.lg,
    gap: spacing.md,
  },
  divider: { flex: 1, height: 1 },
  dividerText: { ...typography.caption },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  googleText: { ...typography.label },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: "700" },
});

export default RegisterScreen;
