import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { sendVerificationOTP, verifyOTP } from "../config/supabase";

const VerificationScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { email, mobile } = route.params || {};
  const [activeTab, setActiveTab] = useState("email"); // 'email' or 'mobile'
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  // Mock verification codes (replace with actual backend integration)
  const mockEmailCode = "123456";
  const mockMobileCode = "987654";

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      setVerificationStatus("error");
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const shakeAnimation = () => {
    setVerificationStatus("error");
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const successAnimation = () => {
    setVerificationStatus("success");
    Animated.spring(successAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setVerificationStatus(null);
    setErrorMessage("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = () => {
    if (timeLeft === 0) {
      setTimeLeft(30);
      setOtp(["", "", "", "", "", ""]);
      sendVerificationCode();
    }
  };

  const verifyCode = (enteredCode) => {
    // Mock verification (replace with actual API call)
    const expectedCode = activeTab === "email" ? mockEmailCode : mockMobileCode;
    return enteredCode === expectedCode;
  };

  const sendVerificationCode = async () => {
    setResendLoading(true);
    try {
      const { error } = await sendVerificationOTP(
        activeTab,
        activeTab === "email" ? email : mobile
      );

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      setTimeLeft(30);
      Alert.alert(
        "Verification Code Sent",
        `A verification code has been sent to your ${
          activeTab === "email" ? "email address" : "mobile number"
        }.`
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to send verification code. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length === 6) {
      setLoading(true);
      try {
        const { error } = await verifyOTP(
          activeTab,
          activeTab === "email" ? email : mobile,
          otpString
        );

        if (error) {
          setVerificationStatus("error");
          setErrorMessage(error.message);
          shakeAnimation();
          return;
        }

        setVerificationStatus("success");
        successAnimation();

        // Show success message and handle navigation
        Alert.alert(
          "Verification Successful",
          activeTab === "email"
            ? "Email verified successfully! Please verify your mobile number next."
            : "Mobile number verified successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                if (activeTab === "email") {
                  setActiveTab("mobile");
                  setOtp(["", "", "", "", "", ""]);
                  setTimeLeft(30);
                  setVerificationStatus(null);
                  sendVerificationCode(); // Send OTP for mobile verification
                } else {
                  navigation.replace("Home");
                }
              },
            },
          ]
        );
      } catch (error) {
        setVerificationStatus("error");
        setErrorMessage("Verification failed. Please try again.");
        shakeAnimation();
      } finally {
        setLoading(false);
      }
    } else {
      setVerificationStatus("error");
      setErrorMessage("Please enter all digits");
      shakeAnimation();
    }
  };

  const getInputStyle = (index) => {
    const baseStyle = [
      styles.otpInput,
      {
        backgroundColor: theme.secondary,
        color: theme.text,
        borderColor:
          verificationStatus === "error"
            ? theme.error
            : otp[index]
            ? theme.primary
            : "transparent",
        borderWidth: verificationStatus === "error" || otp[index] ? 1 : 0,
      },
    ];

    if (verificationStatus === "error") {
      baseStyle.push({ borderColor: theme.error });
    } else if (verificationStatus === "success") {
      baseStyle.push({ borderColor: theme.success || "#4CAF50" });
    }

    return baseStyle;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={24}
          color={theme.text}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Almost there</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "email" && {
                borderBottomColor: theme.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab("email")}
            disabled={!verificationStatus}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "email" ? theme.primary : theme.textSecondary,
                },
              ]}
            >
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "mobile" && {
                borderBottomColor: theme.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab("mobile")}
            disabled={!verificationStatus}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "mobile"
                      ? theme.primary
                      : theme.textSecondary,
                },
              ]}
            >
              Mobile
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Please enter the 6-digit code sent to your{"\n"}
          {activeTab === "email" ? "email" : "mobile number"}{" "}
          <Text style={{ color: theme.primary }}>
            {activeTab === "email" ? email : mobile}
          </Text>
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={getInputStyle(index)}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {errorMessage ? (
          <Animated.Text
            style={[
              styles.errorMessage,
              { color: theme.error },
              { opacity: fadeAnim },
            ]}
          >
            {errorMessage}
          </Animated.Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.verifyButton,
            {
              backgroundColor: theme.primary,
              opacity: loading ? 0.7 : 1,
            },
          ]}
          onPress={handleVerify}
          disabled={loading || otp.some((digit) => !digit)}
        >
          {loading ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text
              style={[styles.verifyButtonText, { color: theme.background }]}
            >
              Verify {activeTab === "email" ? "Email" : "Mobile"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.resendButton,
            {
              opacity: timeLeft > 0 || resendLoading ? 0.5 : 1,
            },
          ]}
          onPress={sendVerificationCode}
          disabled={timeLeft > 0 || resendLoading}
        >
          {resendLoading ? (
            <ActivityIndicator color={theme.textSecondary} />
          ) : (
            <Text
              style={[styles.resendButtonText, { color: theme.textSecondary }]}
            >
              {timeLeft > 0
                ? `Resend code in ${timeLeft}s`
                : "Resend verification code"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 44,
    left: 16,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  backIcon: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 48,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  verifyButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  resendButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
});

export default VerificationScreen;
