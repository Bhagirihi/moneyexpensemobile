import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase, updateUserProfile } from "../config/supabase";
import { showToast } from "../utils/toast";
import { realTimeSync } from "../services/realTimeSync";

const EmailVerificationScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [recheckLoading, setRecheckLoading] = useState(false);
  const email = route.params?.email;

  useEffect(() => {
    checkVerificationStatus();
    // Set up a listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
          setVerificationStatus("verified");
          showToast.success("Email verified successfully!");
          setTimeout(() => {
            navigation.replace("Dashboard");
          }, 2000);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const subscription = realTimeSync.subscribeToVerification(
      checkVerificationStatus
    );
    return () => {
      subscription?.unsubscribe?.(); // Safe call to unsubscribe
    };
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Auth error:", error.message);
        return;
      }

      const user = data?.user;

      if (user?.email_confirmed_at) {
        setVerificationStatus("verified");
        showToast.success("Email verified successfully!");
        setTimeout(() => {
          navigation.replace("Dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
    }
  };

  const handleOpenEmail = () => {
    Linking.openURL("mailto:");
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email || (await supabase.auth.getUser()).data.user.email,
      });

      if (error) throw error;

      showToast.success("Verification email resent successfully!");
    } catch (error) {
      console.error("Error resending verification:", error);
      showToast.error(error.message || "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };

  const handleReCheckVerification = async () => {
    setRecheckLoading(true);
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;

      if (user?.email_confirmed_at) {
        setVerificationStatus("verified");
        showToast.success("Email verified successfully!");
        // Update user profile to trigger any necessary updates
        await updateUserProfile({ updated_at: new Date() });
        setTimeout(() => {
          navigation.replace("Dashboard");
        }, 2000);
      } else {
        showToast.info("Email not verified yet. Please check your inbox.");
      }
    } catch (error) {
      console.error("Error re-checking verification:", error);
      showToast.error("Failed to check verification status");
    } finally {
      setRecheckLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="email-check"
          size={80}
          color={theme.primary}
        />
        <Text style={[styles.title, { color: theme.text }]}>
          Verify Your Email
        </Text>
        <Text style={[styles.message, { color: theme.textSecondary }]}>
          {email
            ? `We have sent a verification link to ${email}. Please verify your email to continue.`
            : "We have sent a verification link to your email. Please verify your email to continue."}
        </Text>

        <View style={styles.statusContainer}>
          {verificationStatus === "pending" ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : (
            <MaterialCommunityIcons
              name="check-circle"
              size={40}
              color={theme.success}
            />
          )}
          <Text style={[styles.statusText, { color: theme.textSecondary }]}>
            {verificationStatus === "pending"
              ? "Waiting for verification..."
              : "Email verified successfully!"}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleOpenEmail}
          >
            <Text style={[styles.buttonText, { color: theme.white }]}>
              Open Email App
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.card }]}
            onPress={handleResendVerification}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.primary }]}>
                Resend Verification
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.card }]}
            onPress={handleReCheckVerification}
            disabled={recheckLoading}
          >
            {recheckLoading ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.primary }]}>
                Re-Check Verification
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  statusText: {
    fontSize: 16,
    marginTop: 10,
  },
  buttonContainer: {
    width: "100%",
    gap: 10,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EmailVerificationScreen;
