import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
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
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components/Header";
import ScreenLayout from "../components/ScreenLayout";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { supabase, signInWithGoogle } from "../config/supabase";
import {
  capitalizeFirstLetter,
  formatCurrency,
  formatDateTime,
} from "../utils/formatters";
import { getBoardSummaries } from "../services/boardAccessService";
import { userService } from "../services/supabaseService";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";
import { PLAN_CATALOG } from "../config/subscriptionPlans";
import { useAppSettings } from "../context/AppSettingsContext";
import { useTranslation } from "../hooks/useTranslation";
import { devLog } from "../utils/logger";
import * as FileSystem from "expo-file-system";
import Card from "../components/common/Card";
import { SectionLabel, SettingsRow } from "../components/ui/UIKit";
import { layout, radii, spacing, typography } from "../theme/tokens";
import { AppTabHeader } from "../components/ui/AppTabHeader";
import { useFooterScrollPadding } from "../hooks/useFooterScrollPadding";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getLocaleFromLanguage = (language) => {
  if (language === "hi") return "hi-IN";
  if (language === "en") return "en-US";
  return "en-IN";
};

export const ProfileScreen = ({ navigation }) => {
  const route = useRoute();
  const isTabRoot = route.params?.tabRoot === true;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = useFooterScrollPadding(0, isTabRoot);
  const { plan, isPremium, paymentsEnabled } = useSubscription();
  const { language } = useAppSettings();
  const locale = getLocaleFromLanguage(language);
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
  const [totalSharedMembers, setTotalSharedMembers] = useState(0);
  const { session } = useAuth();
  const isGoogleconnected =
    session?.user?.identities?.some((i) => i.provider === "google") ?? false;

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
    if (!session?.user?.id) return;
    const userId = session.user.id;

    try {
      const [boardsRes, categoriesRes, sharedRes, summaries] = await Promise.all([
        supabase
          .from("expense_boards")
          .select("id", { count: "exact", head: true })
          .eq("created_by", userId),
        supabase
          .from("categories")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("shared_users")
          .select("id", { count: "exact", head: true })
          .eq("shared_by", userId),
        getBoardSummaries({ force: true }),
      ]);

      const totalExpenses = (summaries || []).reduce(
        (sum, board) => sum + (Number(board.totalExpenses) || 0),
        0
      );

      setTotalExpenses(totalExpenses);
      setTotalCategories(categoriesRes.count || 0);
      setTotalBoards(boardsRes.count || 0);
      setTotalSharedMembers(sharedRes.count || 0);
    } catch (error) {
      console.error("Error loading account stats:", error.message);
    }
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

  const renderProfileHero = () => (
    <Card variant="elevated" style={styles.heroCard} padding="large">
      <View style={styles.heroCenter}>
        <TouchableOpacity onPress={pickAndUploadImage} activeOpacity={0.85}>
          <View style={[styles.avatarRing, { borderColor: theme.primaryMuted }]}>
            <View
              style={[
                styles.profileImage,
                { backgroundColor: theme.primaryMuted },
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
                  size={44}
                  color={theme.primary}
                />
              )}
            </View>
            <View style={[styles.editImageButton, { backgroundColor: theme.primary }]}>
              <MaterialCommunityIcons name="camera" size={14} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>

        {isEditing ? (
          <View style={styles.editFields}>
            <TextInput
              style={[
                styles.profileEditInput,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground },
              ]}
              value={editFullName}
              onChangeText={setEditFullName}
              placeholder="Full name"
              placeholderTextColor={theme.textMuted}
            />
            <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
              {userProfile?.email_address || "No email"}
            </Text>
            <TextInput
              style={[
                styles.profileEditInput,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground },
              ]}
              value={editMobile}
              onChangeText={setEditMobile}
              placeholder="Mobile"
              placeholderTextColor={theme.textMuted}
              keyboardType="phone-pad"
            />
            <View style={styles.profileEditActions}>
              <TouchableOpacity
                style={[styles.profileEditBtn, { backgroundColor: theme.borderLight }]}
                onPress={() => setIsEditing(false)}
                disabled={savingProfile}
              >
                <Text style={[styles.profileEditBtnText, { color: theme.text }]}>
                  {t("cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.profileEditBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveProfile}
                disabled={savingProfile}
              >
                <Text style={[styles.profileEditBtnText, { color: theme.white }]}>
                  {savingProfile ? "..." : t("save")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={[styles.profileName, { color: theme.text }]}>
              {capitalizeFirstLetter(userProfile?.full_name) || "No name"}
            </Text>
            <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
              {userProfile?.email_address || "No email"}
            </Text>
            {userProfile?.mobile ? (
              <Text style={[styles.profilePhone, { color: theme.textMuted }]}>
                {userProfile.mobile}
              </Text>
            ) : null}
            <View style={[styles.planPill, { backgroundColor: theme.primaryMuted }]}>
              <MaterialCommunityIcons
                name={isPremium ? "crown" : "account-circle-outline"}
                size={14}
                color={theme.primary}
              />
              <Text style={[styles.planPillText, { color: theme.primary }]}>
                {t(PLAN_CATALOG[plan]?.nameKey || "planFree")}
              </Text>
            </View>
          </>
        )}
      </View>
    </Card>
  );

  const renderPremiumBanner = () => {
    if (isPremium || !paymentsEnabled) return null;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate("Paywall")}
        style={styles.premiumBannerWrap}
      >
        <LinearGradient
          colors={theme.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.premiumBanner}
        >
          <View style={styles.premiumBannerLeft}>
            <MaterialCommunityIcons name="crown" size={22} color="#FFFFFF" />
            <View>
              <Text style={styles.premiumBannerTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumBannerSub}>
                Unlimited boards, analytics & more
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderStatsGrid = () => {
    const stats = [
      { icon: "cash-multiple", label: "Expenses", value: formatCurrency(totalExpenses), color: theme.primary },
      { icon: "view-grid", label: "Boards", value: String(totalBoards), color: theme.accent },
      { icon: "tag-multiple", label: "Categories", value: String(totalCategories), color: theme.warning },
      { icon: "account-group", label: "Members", value: String(totalSharedMembers), color: theme.info },
    ];

    return (
      <View style={styles.section}>
        <SectionLabel title="Overview" style={{ marginTop: 0 }} />
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <Card key={stat.label} padding="small" style={styles.statTile}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}18` }]}>
                <MaterialCommunityIcons name={stat.icon} size={18} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>{stat.label}</Text>
            </Card>
          ))}
        </View>
      </View>
    );
  };

  const renderAccountMeta = () => (
    <View style={styles.section}>
      <SectionLabel title="Account" />
      <Card padding="none">
        <SettingsRow
          icon="calendar"
          iconColor={theme.primary}
          title="Member since"
          subtitle={(() => {
            const date = session?.user?.created_at || userProfile?.created_at;
            return date
              ? new Date(date).toLocaleDateString(locale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "—";
          })()}
          showChevron={false}
        />
        <SettingsRow
          icon="clock-outline"
          iconColor={theme.accent}
          title="Last login"
          subtitle={formatDateTime(
            session?.user?.last_sign_in_at || userProfile?.updated_at,
            locale
          )}
          showChevron={false}
        />
        <SettingsRow
          icon="google"
          iconColor="#DB4437"
          iconBg="#FEE2E2"
          title="Google account"
          subtitle={isGoogleconnected ? "Connected" : "Not connected"}
          showChevron={false}
          rightElement={
            !isGoogleconnected ? (
              <TouchableOpacity
                style={[styles.connectPill, { backgroundColor: theme.primary }]}
                onPress={async () => {
                  try {
                    const { error } = await signInWithGoogle();
                    if (error && !error?.message?.toLowerCase().includes("cancelled")) {
                      Alert.alert(t("error"), error?.message || "Failed to connect Google");
                    }
                  } catch (e) {
                    Alert.alert(t("error"), e?.message || "Failed to connect Google");
                  }
                }}
              >
                <Text style={styles.connectPillText}>Connect</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.connectedBadge, { backgroundColor: `${theme.success}18` }]}>
                <Text style={[styles.connectedText, { color: theme.success }]}>Active</Text>
              </View>
            )
          }
          isLast
        />
      </Card>
    </View>
  );

  const renderSettingsSection = () => {
    const items = [
      {
        icon: "cog-outline",
        iconColor: theme.primary,
        title: "Settings",
        subtitle: "Budget, currency & preferences",
        onPress: () => navigation.navigate("Settings"),
      },
      {
        icon: "bell-outline",
        iconColor: theme.warning,
        title: "Notifications",
        subtitle: "Alerts and reminders",
        onPress: () => navigation.navigate("Notification"),
      },
      {
        icon: "help-circle-outline",
        iconColor: theme.info,
        title: "Help & Support",
        subtitle: "Get help when you need it",
        onPress: () => {
          Alert.alert("Coming Soon", "Support features will be available soon!");
        },
      },
      {
        icon: "information-outline",
        iconColor: theme.textSecondary,
        title: "About",
        subtitle: "Trivense v1.0.0",
        onPress: () => {
          Alert.alert("About", `Trivense v1.0.0\n\n${t("brandTagline")}`);
        },
        isLast: true,
      },
    ];

    return (
      <View style={styles.section}>
        <SectionLabel title="Quick links" />
        <Card padding="none">
          {items.map((item, index) => (
            <SettingsRow
              key={item.title}
              icon={item.icon}
              iconColor={item.iconColor}
              title={item.title}
              subtitle={item.subtitle}
              onPress={item.onPress}
              isLast={item.isLast || index === items.length - 1}
            />
          ))}
        </Card>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenLayout navigation={navigation} footerRoute={isTabRoot ? "Profile" : null}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading profile...
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  const editButton = (
    <TouchableOpacity
      onPress={handleEditProfile}
      style={[styles.editButton, { backgroundColor: theme.primaryMuted }]}
    >
      <MaterialCommunityIcons
        name={isEditing ? "close" : "pencil"}
        size={18}
        color={theme.primary}
      />
    </TouchableOpacity>
  );

  return (
    <ScreenLayout
      navigation={navigation}
      footerRoute={isTabRoot ? "Profile" : null}
      showAdBanner={false}
      header={
        isTabRoot ? null : (
          <Header
            title={t("profile")}
            onBack={() => navigation.goBack()}
            rightComponent={editButton}
          />
        )
      }
    >
      {isTabRoot ? (
        <AppTabHeader
          compact
          title={t("profile")}
          trailing={editButton}
        />
      ) : null}
      <Animated.ScrollView
        style={styles.content}
        contentContainerStyle={{
          paddingBottom: isTabRoot
            ? scrollBottomPadding
            : spacing.xxl + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {renderProfileHero()}
        {renderPremiumBanner()}
        {renderStatsGrid()}
        {renderAccountMeta()}
        {renderSettingsSection()}
      </Animated.ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: { ...typography.bodyMedium },
  heroCard: { marginBottom: spacing.lg },
  heroCenter: { alignItems: "center" },
  avatarRing: {
    position: "relative",
    padding: 4,
    borderRadius: 999,
    borderWidth: 3,
    marginBottom: spacing.md,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  editImageButton: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileName: {
    ...typography.h2,
    fontSize: 22,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  profileEmail: {
    ...typography.caption,
    textAlign: "center",
    fontWeight: "500",
  },
  profilePhone: {
    ...typography.caption,
    textAlign: "center",
    marginTop: 2,
  },
  planPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  planPillText: { ...typography.caption, fontWeight: "700" },
  editFields: { width: "100%", marginTop: spacing.sm },
  profileEditInput: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    ...typography.body,
    textAlign: "center",
  },
  profileEditActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
    justifyContent: "center",
  },
  profileEditBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
  },
  profileEditBtnText: { ...typography.label },
  premiumBannerWrap: { marginBottom: spacing.lg },
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderRadius: radii.lg,
  },
  premiumBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  premiumBannerTitle: {
    color: "#FFFFFF",
    ...typography.label,
    fontWeight: "700",
  },
  premiumBannerSub: {
    color: "rgba(255,255,255,0.8)",
    ...typography.caption,
    marginTop: 2,
    fontWeight: "400",
  },
  section: { marginBottom: spacing.lg },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statTile: {
    width: "48%",
    flexGrow: 1,
    minWidth: "46%",
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  statValue: { ...typography.label, fontWeight: "700", marginBottom: 2 },
  statLabel: { ...typography.micro },
  connectPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  connectPillText: { color: "#FFFFFF", ...typography.caption, fontWeight: "700" },
  connectedBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  connectedText: { ...typography.caption, fontWeight: "700" },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  // legacy styles kept for unused premium/connection renderers
  profileImageSection: { marginBottom: 24, borderRadius: 16, padding: 20 },
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
      android: {},
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
      android: {},
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
      android: {},
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
      android: {},
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
