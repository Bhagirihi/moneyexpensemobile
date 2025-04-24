import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
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
import { useAuth } from "../context/AuthContext";
import * as FileSystem from "expo-file-system";

export const InvitationsScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);

  const { session } = useAuth();
  const [sharedUsers, setSharedUsers] = useState([]);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    fetchSharedUsers();
  }, []);

  const fetchSharedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("shared_users")
        .select(
          `
          *,
          profiles:user_id (
            id,
            full_name,
            email_address
          ),
          expense_boards:board_id (
            name
          )
        `
        )
        .eq("shared_by", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enrich users with fallback profile data if needed
      const enrichedData = await Promise.all(
        (data || []).map(async (user) => {
          let profile = user.profiles;

          // Fallback: fetch profile using shared_with email
          if (!profile && user.shared_with) {
            const { data: fallbackProfile } = await supabase
              .from("profiles")
              .select("id, full_name, email_address")
              .eq("email_address", user.shared_with)
              .single();

            if (fallbackProfile) {
              profile = fallbackProfile;
            }
          }

          return {
            ...user,
            profiles: profile,
          };
        })
      );

      setSharedUsers(enrichedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching shared users:", error.message);
      setLoading(false);
    }
  };

  const handleRemoveUser = async (sharedUserId, boardId, userName) => {
    try {
      setIsRemoving(true);

      const { error } = await supabase
        .from("shared_users")
        .delete()
        .eq("id", sharedUserId);

      if (error) throw error;

      // Refresh the shared users list
      await fetchSharedUsers();

      Alert.alert("Success", `${userName} has been removed from the board`, [
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Error removing user:", error.message);
      Alert.alert("Error", "Failed to remove user. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsRemoving(false);
    }
  };

  const confirmRemoveUser = (sharedUserId, boardId, userName) => {
    Alert.alert(
      "Remove User",
      `Are you sure you want to remove ${userName} from this board?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => handleRemoveUser(sharedUserId, boardId, userName),
        },
      ]
    );
  };

  const renderUserCard = (user) => (
    <View
      key={user.id}
      style={[styles.userCard, { backgroundColor: theme.cardBackground }]}
    >
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <View
            style={[
              styles.avatarFallback,
              { backgroundColor: `${theme.primary}15` },
            ]}
          >
            <MaterialCommunityIcons
              name="account"
              size={24}
              color={theme.primary}
            />
          </View>
        </View>
        <View style={styles.userDetails}>
          <View style={styles.userHeader}>
            <View style={styles.userInfoText}>
              <Text style={[styles.userName, { color: theme.text }]}>
                {user?.profiles?.full_name || "No name"}
              </Text>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                {user?.profiles?.email_address || "No email"}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.removeButton,
                { backgroundColor: `${theme.error}15` },
              ]}
              onPress={() =>
                confirmRemoveUser(
                  user.id,
                  user.board_id,
                  user.profiles?.full_name || "User"
                )
              }
              disabled={isRemoving}
            >
              <MaterialCommunityIcons
                name="account-remove"
                size={16}
                color={theme.error}
              />
              <Text style={[styles.removeText, { color: theme.error }]}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.boardInfo}>
            <MaterialCommunityIcons
              name="view-grid"
              size={14}
              color={theme.textSecondary}
            />
            <Text style={[styles.boardName, { color: theme.textSecondary }]}>
              {user.expense_boards?.name || "Unknown Board"}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.userMeta}>
        <Text style={[styles.sharedDate, { color: theme.textSecondary }]}>
          Shared on {formatDateTime(user.created_at)}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: user.is_accepted
                ? `${theme.success}15`
                : `${theme.warning}15`,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={user.is_accepted ? "check-circle" : "clock-outline"}
            size={14}
            color={user.is_accepted ? theme.success : theme.warning}
          />
          <Text
            style={[
              styles.statusText,
              {
                color: user.is_accepted ? theme.success : theme.warning,
              },
            ]}
          >
            {user.is_accepted ? "Accepted" : "Pending"}
          </Text>
        </View>
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
            Loading shared users...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header title="Shared Users" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sharedUsers.length > 0 ? (
          sharedUsers.map((user) => renderUserCard(user))
        ) : (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons
              name="account-group"
              size={48}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
              No Shared Users
            </Text>
            <Text
              style={[styles.emptyStateText, { color: theme.textSecondary }]}
            >
              You haven't shared any boards with other users yet.
            </Text>
          </View>
        )}
      </ScrollView>
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  userCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  userInfo: {
    flexDirection: "row",
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  userDetails: {
    flex: 1,
    gap: 4,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  userInfoText: {
    flex: 1,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  userEmail: {
    fontSize: 14,
  },
  boardInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  boardName: {
    fontSize: 13,
  },
  userMeta: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#00000010",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sharedDate: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
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
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 2,
  },
  removeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
