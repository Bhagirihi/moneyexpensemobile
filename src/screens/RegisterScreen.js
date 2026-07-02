import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { signUpWithEmail, signInWithGoogle } from "../config/supabase";
import { isValidEmail } from "../utils/validation";
import { showToast } from "../utils/toast";
import AuthShell from "../components/ui/AuthShell";
import FormButton from "../components/common/FormButton";
import { createAuthFormStyles } from "../components/ui/authFormStyles";
import { useTranslation } from "../hooks/useTranslation";
import {
  getPendingReferralCode,
  normalizeReferralCode,
  setPendingReferralCode,
} from "../utils/referralStorage";
import { markPostRegisterSetupPending, clearPostRegisterSetupPending } from "../utils/postRegisterSetupStorage";
import { navigateAfterRegisterAuth } from "../utils/postRegisterNavigation";

const RegisterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const route = useRoute();
  const compact = true;
  const styles = useMemo(() => createAuthFormStyles(compact), [compact]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const fromRoute = normalizeReferralCode(route.params?.referralCode);
      const fromStorage = await getPendingReferralCode();
      const code = fromRoute || fromStorage;
      if (code) {
        setFormData((prev) => ({ ...prev, referralCode: code }));
        await setPendingReferralCode(code);
      }
    })();
  }, [route.params?.referralCode]);

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
      if (formData.referralCode.trim()) {
        await setPendingReferralCode(formData.referralCode);
      }

      await markPostRegisterSetupPending();

      const { data, error: signUpError } = await signUpWithEmail(
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

      if (signUpError) {
        await clearPostRegisterSetupPending();
        throw signUpError;
      }

      if (data?.user?.email_confirmed_at) {
        await navigateAfterRegisterAuth(navigation, { userId: data.user.id });
        return;
      }

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
      if (formData.referralCode.trim()) {
        await setPendingReferralCode(formData.referralCode);
      }

      await markPostRegisterSetupPending();

      const { data, error } = await signInWithGoogle();
      if (error) {
        await clearPostRegisterSetupPending();
        throw error;
      }

      if (data?.user?.email_confirmed_at) {
        await navigateAfterRegisterAuth(navigation, { userId: data.user.id });
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
            size={18}
            color={theme.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            testID={`register-${key}-input`}
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
  };

  return (
    <AuthShell
      testID="screen-register"
      compact
      title="Create account"
      subtitle={t("brandTagline")}
      showSubtitle={false}
      footer={
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity
            testID="register-go-login"
            accessibilityRole="link"
            accessibilityLabel="register-sign-in-link"
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={[styles.footerLink, { color: theme.primary }]}>Sign in</Text>
          </TouchableOpacity>
        </View>
      }
    >
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
            <MaterialCommunityIcons name="google" size={18} color="#4285F4" />
            <Text style={[styles.googleText, { color: theme.text }]}>
              Continue with Google
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Text style={[styles.dividerText, { color: theme.textMuted }]}>
          or sign up with email
        </Text>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
      </View>

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
        placeholder: "10-digit mobile",
        keyboard: "phone-pad",
        maxLength: 10,
      })}

      {renderField("Password", "password", {
        icon: "lock-outline",
        placeholder: "Min. 8 characters",
        secure: true,
        secureKey: "password",
      })}
      {renderField("Confirm password", "confirmPassword", {
        icon: "lock-check-outline",
        placeholder: "Re-enter password",
        secure: true,
        secureKey: "confirm",
      })}

      {renderField(t("referralCodeOptional"), "referralCode", {
        icon: "ticket-percent-outline",
        placeholder: t("referralCodePlaceholder"),
        autoCapitalize: "characters",
        maxLength: 12,
      })}

      {formData.referralCode.trim() ? (
        <Text style={[styles.referralHint, { color: theme.textSecondary }]}>
          {t("referralRewardHint")}
        </Text>
      ) : null}

      <FormButton
        testID="register-submit-button"
        accessibilityLabel="register-submit-button"
        title="Create account"
        onPress={handleRegister}
        loading={loading}
        size="medium"
        style={styles.submitBtn}
      />
    </AuthShell>
  );
};

export default RegisterScreen;
