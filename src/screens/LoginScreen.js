import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { supabase, signInWithGoogle } from "../config/supabase";
import { showToast } from "../utils/toast";
import { isValidEmail } from "../utils/validation";
import AuthShell from "../components/ui/AuthShell";
import FormButton from "../components/common/FormButton";
import { createAuthFormStyles } from "../components/ui/authFormStyles";
import { useTranslation } from "../hooks/useTranslation";

export const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const compact = height < 760;
  const styles = useMemo(() => createAuthFormStyles(compact), [compact]);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!isValidEmail(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });
      if (error) {
        if (
          error.message === "Email not confirmed" ||
          error.message?.toLowerCase().includes("email not confirmed")
        ) {
          navigation.reset({
            index: 0,
            routes: [{ name: "EmailVerification", params: { email: formData.email.trim() } }],
          });
          return;
        }
        showToast.error(error.message || "Failed to login");
        return;
      }
      if (data?.user?.email_confirmed_at) navigation.replace("Dashboard");
    } catch (error) {
      showToast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { data, error } = await signInWithGoogle();
      if (error) throw error;
      if (data?.user?.email_confirmed_at) navigation.replace("Dashboard");
      else navigation.replace("EmailVerification", { email: data?.user?.email });
    } catch (error) {
      if (!error?.message?.toLowerCase().includes("cancelled")) {
        showToast.error(error?.message || "Google sign-in failed");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const renderField = (label, key, options = {}) => (
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
          size={18}
          color={theme.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          testID={`login-${key}-input`}
          style={[styles.input, { color: theme.text }]}
          placeholder={options.placeholder}
          placeholderTextColor={theme.textMuted}
          value={formData[key]}
          onChangeText={(text) => {
            setFormData((p) => ({ ...p, [key]: text }));
            if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
          }}
          secureTextEntry={options.secure && !showPassword}
          keyboardType={options.keyboard || "default"}
          autoCapitalize={options.autoCapitalize || "none"}
        />
        {options.secure ? (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <MaterialCommunityIcons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
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

  return (
    <AuthShell
      testID="screen-login"
      title="Welcome back"
      subtitle={t("brandTagline")}
      showSubtitle={!compact}
      footer={
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity
            testID="login-go-register"
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={[styles.footerLink, { color: theme.primary }]}>Create account</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <TouchableOpacity
        style={[styles.googleBtn, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}
        onPress={handleGoogleLogin}
        disabled={googleLoading}
        activeOpacity={0.85}
      >
        {googleLoading ? (
          <Text style={{ color: theme.text }}>...</Text>
        ) : (
          <>
            <MaterialCommunityIcons name="google" size={18} color="#4285F4" />
            <Text style={[styles.googleText, { color: theme.text }]}>Continue with Google</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Text style={[styles.dividerText, { color: theme.textMuted }]}>or sign in with email</Text>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
      </View>

      {renderField("Email", "email", {
        icon: "email-outline",
        placeholder: "you@example.com",
        keyboard: "email-address",
      })}
      {renderField("Password", "password", {
        icon: "lock-outline",
        placeholder: "Your password",
        secure: true,
      })}

      <TouchableOpacity
        testID="login-forgot-password"
        style={styles.forgot}
        onPress={() => navigation.navigate("ForgotPassword")}
      >
        <Text style={[styles.forgotText, { color: theme.primary }]}>Forgot password?</Text>
      </TouchableOpacity>

      <FormButton
        testID="login-sign-in-button"
        title="Sign in"
        onPress={handleLogin}
        loading={loading}
        size={compact ? "medium" : "large"}
      />
    </AuthShell>
  );
};

export default LoginScreen;
