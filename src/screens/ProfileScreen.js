import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components/Header";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../config/supabase";
import {
  capitalizeFirstLetter,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "../utils/formatters";
import { expenseBoardService } from "../services/expenseBoardService";
import { categoryService } from "../services/categoryService";
import { userService } from "../services/supabaseService";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import { devLog } from "../utils/logger";
import * as FileSystem from "expo-file-system";

export const ProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalBoards, setTotalBoards] = useState(0);
  const featureAnimation = useRef(new Animated.Value(0)).current;
  const [isGoogleconnected, setIsGoogleconnected] = useState(false);
  const [totalSharedMembers, setTotalSharedMembers] = useState(0);
  const { session } = useAuth();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      if (session.user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        const { data: ImageData, error: ImageError } = await supabase.storage
          .from("avatars")
          .list(session.user.id);

        if (error) throw error;

        accountStatics();
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error.message);
      Alert.alert(t("error"), t("failedToLoadProfile"));
    } finally {
      setLoading(false);
    }
  };

  const accountStatics = async () => {
    const expenseBoards = await expenseBoardService.getExpenseBoards();
    const categories = await categoryService.getCategories();
    const sharedMembers = await expenseBoardService.getSharedMembers();

    const totalExpenses = expenseBoards.reduce(
      (sum, board) => sum + (board.totalExpenses || 0),
      0
    );
    const totalCategories = categories.length;
    const totalBoards = expenseBoards.length;
    const totalSharedMembers = sharedMembers.length;

    setTotalExpenses(totalExpenses);
    setTotalCategories(totalCategories);
    setTotalBoards(totalBoards);
    setTotalSharedMembers(totalSharedMembers);
  };

  const handleEditProfile = () => {
    if (!isEditing) {
      setEditFullName(userProfile?.full_name ?? "");
      setEditMobile(userProfile?.mobile ?? "");
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const { profile, error } = await userService.updateProfile({
        full_name: editFullName.trim() || null,
        mobile: editMobile.trim() || null,
      });
      if (error) throw error;
      setUserProfile(profile);
      setIsEditing(false);
      Alert.alert(t("success") || "Success", t("profileUpdated") || "Profile updated successfully");
    } catch (err) {
      Alert.alert(t("error") || "Error", err?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleFeature = (index) => {
    if (expandedFeature === index) {
      Animated.timing(featureAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => setExpandedFeature(null));
    } else {
      setExpandedFeature(index);
      Animated.timing(featureAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const pickAndUploadImage = async (userId) => {
    try {
      if (!userId) {
        userId = session?.user?.id;
        if (!userId) {
          throw new Error("User ID is missing.");
        }
      }
      // Ask for permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please grant camera access to upload images"
        );
        return;
      }

      // Pick image from gallery
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (result.canceled) return;

      const publicUrl = await uploadImageToSupabase(result);

      // Update DB with new avatar URL
      const { data, error } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", session.user.id); // ✅ string, works

      if (error) devLog("error", error);
      setUserProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
    } catch (error) {
      console.error("Image Upload Error:", error.message);
      Alert.alert("Error", "Something went wrong while uploading image.");
    }
  };

  const uploadImageToSupabase = async (ImageData) => {
    const { uri, mimeType } = ImageData.assets[0];
    try {
      const userId = session?.user?.id; // Ensure user is logged in
      if (!userId) throw new Error("User not logged in");

      // Convert image URI to base64
      const base64Image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create a filename and path
      const fileExt = uri.split(".").pop()?.split("?")[0] || "jpg";
      const filename = `${Date.now()}.${fileExt}`;
      const path = `${userId}/${filename}`;
      const fileType = `image/${fileExt}`;

      const file = {
        uri: uri,
        name: filename,
        type: fileType,
      };
      // Now upload the base64 image to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          contentType: fileType, // Ensure proper content type
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);

      devLog("Image uploaded successfully. Public URL:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("Error in uploadImageToSupabase:", error);
      throw error;
    }
  };

  const renderProfileImage = () => (
    <View
      style={[
        styles.profileImageSection,
        { backgroundColor: theme.cardBackground },
      ]}
    >
      <View style={styles.profileRow}>
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={pickAndUploadImage}>
            <View
              style={[
                styles.profileImage,
                { backgroundColor: `${theme.primary}15` },
              ]}
            >
              {userProfile?.avatar_url ? (
                <Image
                  source={{ uri: userProfile.avatar_url }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <MaterialCommunityIcons
                  name="account"
                  size={50}
                  color={theme.primary}
                />
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.editImageButton,
                { backgroundColor: theme.primary },
              ]}
              onPress={pickAndUploadImage}
            >
              <MaterialCommunityIcons name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        <View style={styles.profileDetails}>
          {isEditing ? (
            <>
              <TextInput
                style={[styles.profileName, styles.profileEditInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
                value={editFullName}
                onChangeText={setEditFullName}
                placeholder="Full name"
                placeholderTextColor={theme.textSecondary}
              />
              <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
                {userProfile?.email_address || "No email"}
              </Text>
              <TextInput
                style={[styles.profilePhone, styles.profileEditInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
                value={editMobile}
                onChangeText={setEditMobile}
                placeholder="Mobile"
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
              />
              <View style={styles.profileEditActions}>
                <TouchableOpacity
                  style={[styles.profileEditBtn, { backgroundColor: theme.border }]}
                  onPress={() => setIsEditing(false)}
                  disabled={savingProfile}
                >
                  <Text style={[styles.profileEditBtnText, { color: theme.text }]}>{t("cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.profileEditBtn, { backgroundColor: theme.primary }]}
                  onPress={handleSaveProfile}
                  disabled={savingProfile}
                >
                  <Text style={[styles.profileEditBtnText, { color: theme.white }]}>{savingProfile ? "..." : t("save")}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.profileName, { color: theme.text }]}>
                {capitalizeFirstLetter(userProfile?.full_name) || "No name"}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
                {userProfile?.email_address || "No email Address"}
              </Text>
              <Text style={[styles.profilePhone, { color: theme.textSecondary }]}>
                {userProfile?.mobile || "No phone Number"}
              </Text>
            </>
          )}
          {!isEditing && (
          <View style={styles.profileBadge}>
            <MaterialCommunityIcons
              name="check-circle"
              size={14}
              color={theme.success}
            />
            <Text style={[styles.profileBadgeText, { color: theme.success }]}>
              Verified Account
            </Text>
          </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderSubscriptionStatus = () => (
    <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.sectionHeader}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${theme.primary}15` },
          ]}
        >
          <MaterialCommunityIcons
            name="crown"
            size={24}
            color={theme.primary}
          />
        </View>
        <View style={styles.sectionTitleContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Premium Access
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
          >
            Unlock all premium features
          </Text>
        </View>
      </View>

      <View style={styles.subscriptionInfo}>
        <View style={styles.premiumHeader}>
          <View style={styles.premiumBadgeContainer}>
            <View
              style={[
                styles.planBadge,
                { backgroundColor: `${theme.primary}15` },
              ]}
            >
              <MaterialCommunityIcons
                name="star"
                size={16}
                color={theme.primary}
                style={styles.planIcon}
              />
              <Text style={[styles.planValue, { color: theme.primary }]}>
                Free Plan
              </Text>
            </View>
            <View style={styles.premiumPriceContainer}>
              <Text style={[styles.premiumPrice, { color: theme.text }]}>
                ₹299
              </Text>
              <Text
                style={[styles.premiumPeriod, { color: theme.textSecondary }]}
              >
                /month
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.upgradePremiumButton,
              { backgroundColor: theme.primary },
            ]}
            onPress={() => {
              Alert.alert(
                "Coming Soon",
                "Premium features will be available soon!"
              );
            }}
          >
            <MaterialCommunityIcons
              name="crown"
              size={20}
              color="#FFFFFF"
              style={styles.upgradeIcon}
            />
            <Text style={styles.upgradePremiumText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.premiumFeatures}>
          <Text style={[styles.featuresTitle, { color: theme.text }]}>
            Premium Features
          </Text>
          <View style={styles.featuresList}>
            {[
              {
                icon: "view-grid-plus",
                title: "Unlimited Boards",
                description: "Create unlimited expense boards",
                details: [
                  "Create and manage unlimited expense boards",
                  "Customize board settings and permissions",
                  "Share boards with team members",
                  "Advanced board analytics",
                ],
                color: theme.primary,
              },
              {
                icon: "chart-line",
                title: "Advanced Analytics",
                description: "Detailed insights and reports",
                details: [
                  "Comprehensive expense analytics",
                  "Custom report generation",
                  "Trend analysis and forecasting",
                  "Export data in multiple formats",
                ],
                color: theme.success,
              },
              {
                icon: "file-export",
                title: "Export Data",
                description: "Export to PDF/Excel",
                details: [
                  "Export to PDF, Excel, and CSV",
                  "Custom report templates",
                  "Automated report scheduling",
                  "Batch export capabilities",
                ],
                color: theme.warning,
              },
              {
                icon: "headphones",
                title: "Priority Support",
                description: "24/7 dedicated support",
                details: [
                  "24/7 dedicated customer support",
                  "Priority ticket resolution",
                  "Direct access to support team",
                  "Regular account reviews",
                ],
                color: theme.info,
              },
              {
                icon: "tag-multiple",
                title: "Custom Categories",
                description: "Create custom categories",
                details: [
                  "Create unlimited custom categories",
                  "Category-specific analytics",
                  "Smart categorization rules",
                  "Category templates",
                ],
                color: theme.error,
              },
              {
                icon: "cloud",
                title: "Cloud Backup",
                description: "Automatic data backup",
                details: [
                  "Automatic daily backups",
                  "Version history",
                  "Secure data storage",
                  "Cross-device sync",
                ],
                color: theme.primary,
              },
            ].map((feature, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.featureCard,
                  { backgroundColor: `${feature.color}10` },
                  expandedFeature === index && {
                    transform: [{ scale: 1.02 }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.featureCardHeader}
                  onPress={() => toggleFeature(index)}
                >
                  <View
                    style={[
                      styles.featureIconContainer,
                      { backgroundColor: `${feature.color}15` },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={feature.icon}
                      size={24}
                      color={feature.color}
                    />
                  </View>
                  <View style={styles.featureCardContent}>
                    <Text
                      style={[styles.featureCardTitle, { color: theme.text }]}
                    >
                      {feature.title}
                    </Text>
                    <Text
                      style={[
                        styles.featureCardDescription,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {feature.description}
                    </Text>
                  </View>
                  <Animated.View
                    style={{
                      transform: [
                        {
                          rotate: expandedFeature === index ? "180deg" : "0deg",
                        },
                      ],
                    }}
                  >
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={24}
                      color={theme.textSecondary}
                    />
                  </Animated.View>
                </TouchableOpacity>
                <Animated.View
                  style={[
                    styles.featureDetails,
                    {
                      maxHeight: expandedFeature === index ? 200 : 0,
                      opacity: expandedFeature === index ? 1 : 0,
                    },
                  ]}
                >
                  {feature.details.map((detail, idx) => (
                    <View key={idx} style={styles.featureDetailItem}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={16}
                        color={feature.color}
                      />
                      <Text
                        style={[
                          styles.featureDetailText,
                          { color: theme.text },
                        ]}
                      >
                        {detail}
                      </Text>
                    </View>
                  ))}
                </Animated.View>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={styles.premiumFooter}>
          <View style={styles.premiumGuarantee}>
            <MaterialCommunityIcons
              name="shield-check"
              size={20}
              color={theme.success}
            />
            <Text style={[styles.guaranteeText, { color: theme.text }]}>
              30-day money-back guarantee
            </Text>
          </View>
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => {
              Alert.alert(
                "Coming Soon",
                "Premium features will be available soon!"
              );
            }}
          >
            <Text style={[styles.learnMoreText, { color: theme.primary }]}>
              Learn more about Premium
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderAccountConnections = () => (
    <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.sectionHeader}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${theme.primary}15` },
          ]}
        >
          <MaterialCommunityIcons name="link" size={24} color={theme.primary} />
        </View>
        <View style={styles.sectionTitleContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Account Connections
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
          >
            Connect your accounts for better experience
          </Text>
        </View>
      </View>

      <View style={styles.connectionsList}>
        {[
          {
            name: "Google",
            icon: "google",
            color: "#DB4437",
            connected: false,
          },
        ].map((connection, index) => (
          <View key={index} style={styles.connectionItem}>
            <View style={styles.connectionLeft}>
              <View
                style={[
                  styles.socialIconContainer,
                  { backgroundColor: connection.color },
                ]}
              >
                <MaterialCommunityIcons
                  name={connection.icon}
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <View>
                <Text style={[styles.connectionText, { color: theme.text }]}>
                  {connection.name}
                </Text>
                <Text
                  style={[
                    styles.connectionStatus,
                    {
                      color: connection.connected ? theme.success : theme.error,
                    },
                  ]}
                >
                  {connection.connected ? "✓ Connected" : "× Not connected"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.connectButton,
                {
                  backgroundColor: connection.connected
                    ? theme.success
                    : theme.primary,
                },
              ]}
              onPress={() => {
                Alert.alert(
                  "Coming Soon",
                  "Social connections will be available soon!"
                );
              }}
            >
              <Text style={styles.connectButtonText}>
                {connection.connected ? "Connected" : "Connect"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderAccountStatistics = () => (
    <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.sectionHeader}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${theme.primary}15` },
          ]}
        >
          <MaterialCommunityIcons
            name="chart-box"
            size={24}
            color={theme.primary}
          />
        </View>
        <View style={styles.sectionTitleContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Account Statistics
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
          >
            Your account activity overview
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statsCard,
              { backgroundColor: `${theme.primary}10` },
            ]}
          >
            <View style={styles.statsCardHeader}>
              <MaterialCommunityIcons
                name="cash-multiple"
                size={20}
                color={theme.primary}
              />
              <Text style={[styles.statsCardTitle, { color: theme.text }]}>
                Total Expenses
              </Text>
            </View>
            <Text style={[styles.statsCardValue, { color: theme.text }]}>
              {formatCurrency(totalExpenses)}
            </Text>
            <Text
              style={[styles.statsCardSubtext, { color: theme.textSecondary }]}
            >
              This month
            </Text>
          </View>

          <View
            style={[
              styles.statsCard,
              { backgroundColor: `${theme.success}10` },
            ]}
          >
            <View style={styles.statsCardHeader}>
              <MaterialCommunityIcons
                name="view-grid"
                size={20}
                color={theme.success}
              />
              <Text style={[styles.statsCardTitle, { color: theme.text }]}>
                Expense Boards
              </Text>
            </View>
            <Text style={[styles.statsCardValue, { color: theme.text }]}>
              {totalBoards}
            </Text>
            <Text
              style={[styles.statsCardSubtext, { color: theme.textSecondary }]}
            >
              Active boards
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View
            style={[
              styles.statsCard,
              { backgroundColor: `${theme.warning}10` },
            ]}
          >
            <View style={styles.statsCardHeader}>
              <MaterialCommunityIcons
                name="tag"
                size={20}
                color={theme.warning}
              />
              <Text style={[styles.statsCardTitle, { color: theme.text }]}>
                Categories
              </Text>
            </View>
            <Text style={[styles.statsCardValue, { color: theme.text }]}>
              {totalCategories}
            </Text>
            <Text
              style={[styles.statsCardSubtext, { color: theme.textSecondary }]}
            >
              Custom categories
            </Text>
          </View>

          <View
            style={[styles.statsCard, { backgroundColor: `${theme.info}10` }]}
          >
            <View style={styles.statsCardHeader}>
              <MaterialCommunityIcons
                name="account-group"
                size={20}
                color={theme.text}
              />
              <Text style={[styles.statsCardTitle, { color: theme.text }]}>
                Members
              </Text>
            </View>
            <Text style={[styles.statsCardValue, { color: theme.text }]}>
              {totalSharedMembers}
            </Text>
            <Text
              style={[styles.statsCardSubtext, { color: theme.textSecondary }]}
            >
              Total members
            </Text>
          </View>
        </View>

        <View style={styles.statsDetails}>
          <View style={styles.statsDetailItem}>
            <View style={styles.statsDetailLeft}>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color={theme.textSecondary}
              />
              <Text style={[styles.statsDetailText, { color: theme.text }]}>
                Member Since
              </Text>
            </View>
            <Text
              style={[styles.statsDetailValue, { color: theme.textSecondary }]}
            >
              {formatDate(userProfile?.created_at)}
            </Text>
          </View>

          <View style={styles.statsDetailItem}>
            <View style={styles.statsDetailLeft}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color={theme.textSecondary}
              />
              <Text style={[styles.statsDetailText, { color: theme.text }]}>
                Last Login
              </Text>
            </View>
            <Text
              style={[styles.statsDetailValue, { color: theme.textSecondary }]}
            >
              {formatDateTime(userProfile?.updated_at)}
            </Text>
          </View>

          <View style={styles.statsDetailItem}>
            <View style={styles.statsDetailLeft}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={theme.success}
              />
              <Text style={[styles.statsDetailText, { color: theme.text }]}>
                Account Status
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${theme.success}15` },
              ]}
            >
              <Text style={[styles.statusText, { color: theme.success }]}>
                Active
              </Text>
            </View>
          </View>

          <View style={styles.statsDetailItem}>
            <View style={styles.statsDetailLeft}>
              <MaterialCommunityIcons
                name="google"
                size={20}
                color={isGoogleconnected ? theme.success : theme.error}
              />
              <View style={{ flexDirection: "column", gap: 4 }}>
                <Text style={[styles.statsDetailText, { color: theme.text }]}>
                  Google Account
                </Text>
                <Text
                  style={[
                    styles.connectionStatus,
                    {
                      color: isGoogleconnected ? theme.success : theme.error,
                      fontSize: 12,
                    },
                  ]}
                >
                  {isGoogleconnected ? "✓ Connected" : "× Not connected"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isGoogleconnected
                    ? theme.success
                    : theme.primary,
                },
              ]}
              onPress={() => {
                Alert.alert(
                  "Coming Soon",
                  "Social connections will be available soon!"
                );
              }}
            >
              <Text style={styles.connectButtonText}>
                {isGoogleconnected ? "Connected" : "Connect"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSettingsSection = () => (
    <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.settingsList}>
        {[
          {
            icon: "cog",
            title: "Settings",
            subtitle: "Manage your account settings",
            onPress: () => navigation.navigate("Settings"),
          },
          {
            icon: "bell-outline",
            title: "Notifications",
            subtitle: "Manage notification preferences",
            onPress: () => navigation.navigate("Notification"),
          },
          // {
          //   icon: "lock-outline",
          //   title: "Privacy",
          //   subtitle: "Control your privacy settings",
          //   onPress: () => {
          //     Alert.alert(
          //       "Coming Soon",
          //       "Privacy settings will be available soon!"
          //     );
          //   },
          // },
          {
            icon: "help-circle-outline",
            title: "Help & Support",
            subtitle: "Get help and contact support",
            onPress: () => {
              Alert.alert(
                "Coming Soon",
                "Support features will be available soon!"
              );
            },
          },
          {
            icon: "information-outline",
            title: "About",
            subtitle: "App information and version",
            onPress: () => {
              Alert.alert(
                "About",
                "Trivense v1.0.0\n\nTrack your expenses with ease!"
              );
            },
          },
        ].map((setting, index) => (
          <TouchableOpacity
            key={index}
            style={styles.settingItem}
            onPress={setting.onPress}
          >
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.settingIconContainer,
                  { backgroundColor: `${theme.primary}15` },
                ]}
              >
                <MaterialCommunityIcons
                  name={setting.icon}
                  size={20}
                  color={theme.primary}
                />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  {setting.title}
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    { color: theme.textSecondary },
                  ]}
                >
                  {setting.subtitle}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title={t("profile")}
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            onPress={handleEditProfile}
            style={[
              styles.editButton,
              { backgroundColor: `${theme.primary}15` },
            ]}
          >
            <MaterialCommunityIcons
              name={isEditing ? "close" : "pencil"}
              size={18}
              color={theme.primary}
            />
          </TouchableOpacity>
        }
      />
      <Animated.ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {renderProfileImage()}
        {/* {renderSubscriptionStatus()} */}
        {renderAccountStatistics()}
        {/* {renderAccountConnections()} */}
        {renderSettingsSection()}
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  profileImageSection: {
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  profileDetails: {
    flex: 1,
    gap: 6,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
  },
  profileEmail: {
    fontSize: 15,
    fontWeight: "500",
  },
  profilePhone: {
    fontSize: 15,
    fontWeight: "500",
  },
  profileEditInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  profileEditActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  profileEditBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  profileEditBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  profileBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  profileBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  socialIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  subscriptionInfo: {
    marginTop: 12,
  },
  premiumHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 24,
  },
  premiumBadgeContainer: {
    flex: 1,
  },
  premiumPriceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },
  premiumPrice: {
    fontSize: 24,
    fontWeight: "700",
  },
  premiumPeriod: {
    fontSize: 14,
    marginLeft: 4,
  },
  premiumFeatures: {
    marginTop: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  featuresList: {
    gap: 12,
    marginTop: 16,
  },
  featureCard: {
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  featureCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  featureCardContent: {
    flex: 1,
    gap: 4,
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  featureCardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  featureDetails: {
    padding: 16,
    paddingTop: 0,
  },
  featureDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  featureDetailText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  premiumFooter: {
    marginTop: 24,
    gap: 16,
  },
  premiumGuarantee: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  guaranteeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  learnMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
  connectionsList: {
    gap: 16,
  },
  connectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  connectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  connectionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  connectionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  connectionStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  connectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statsContainer: {
    gap: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statsCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  statsCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statsCardTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  statsCardValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  statsCardSubtext: {
    fontSize: 12,
    fontWeight: "500",
  },
  statsDetails: {
    marginTop: 8,
    gap: 12,
  },
  statsDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  statsDetailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statsDetailText: {
    fontSize: 14,
    fontWeight: "500",
  },
  statsDetailValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  settingsList: {
    gap: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  upgradeIcon: {
    marginRight: 8,
  },
  upgradePremiumButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradePremiumText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
