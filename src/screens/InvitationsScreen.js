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

function getInitials(name) {
  if (!name) return "";
  const names = name.split(" ");
  return names.length === 1
    ? names[0][0].toUpperCase()
    : (names[0][0] + names[names.length - 1][0]).toUpperCase();
}

function getAvatarColor(email) {
  // Simple hash for color selection
  const colors = [
    "#FFD700",
    "#FFB6C1",
    "#87CEEB",
    "#90EE90",
    "#FFA07A",
    "#9370DB",
  ];
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash += email.charCodeAt(i);
  return colors[hash % colors.length];
}

export const InvitationsScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);

  const { session } = useAuth();
  const [sharedUsers, setSharedUsers] = useState([]);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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

      // Add dummy records for testing
      const dummyRecords = [
        {
          id: "dummy-accepted",
          profiles: {
            full_name: "John Doe",
            email_address: "john.doe@example.com",
          },
          expense_boards: [
            { name: "Test Board 1" },
            { name: "Test Board 2" },
            { name: "Test Board 3" },
          ],
          is_accepted: true,
          status: "accepted",
          created_at: new Date().toISOString(),
        },
        {
          id: "dummy-rejected",
          profiles: {
            full_name: "Jane Smith",
            email_address: "jane.smith@example.com",
          },
          expense_boards: [{ name: "Test Board 1" }, { name: "Test Board 2" }],
          is_accepted: false,
          status: "rejected",
          created_at: new Date().toISOString(),
        },
      ];

      // Enrich users with fallback profile data if needed
      const enrichedData = await Promise.all(
        [...(data || []), ...dummyRecords].map(async (user) => {
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
      console.log("enrichedData", enrichedData);

      setSharedUsers(enrichedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching shared users:", error.message);
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (sharedUserId) => {
    try {
      setIsUpdating(true);

      // Update the invitation status in the database
      const { error } = await supabase
        .from("shared_users")
        .update({ is_accepted: true, status: "accepted" })
        .eq("id", sharedUserId);

      if (error) throw error;

      // Refresh the shared users list
      await fetchSharedUsers();

      Alert.alert("Success", "Invitation accepted successfully", [
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Error accepting invitation:", error.message);
      Alert.alert("Error", "Failed to accept invitation. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectInvitation = async (sharedUserId) => {
    try {
      setIsUpdating(true);

      // Update the invitation status in the database
      const { error } = await supabase
        .from("shared_users")
        .update({ is_accepted: false, status: "rejected" })
        .eq("id", sharedUserId);

      if (error) throw error;

      // Refresh the shared users list
      await fetchSharedUsers();

      Alert.alert("Success", "Invitation rejected successfully", [
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Error rejecting invitation:", error.message);
      Alert.alert("Error", "Failed to reject invitation. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsUpdating(false);
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

  // Dummy expiration for demonstration
  function getExpirationText(user) {
    // You can replace this with real logic if you have expiration info
    if (user.id === "dummy-accepted") return "48h";
    if (user.id === "dummy-rejected") return "15h";
    return "24h";
  }

  function getStatusBadge(user) {
    if (user?.is_accepted) {
      return (
        <View
          style={[
            styles.badge,
            { backgroundColor: theme.badge.member.background },
          ]}
        >
          <Text style={[styles.badgeText, { color: theme.badge.member.text }]}>
            Member
          </Text>
        </View>
      );
    } else {
      return (
        <View
          style={[
            styles.badge,
            { backgroundColor: theme.badge.invited.background },
          ]}
        >
          <Text style={[styles.badgeText, { color: theme.badge.invited.text }]}>
            Invited
          </Text>
        </View>
      );
    }
  }

  

  function getBoardBadge(user) {
    if (!user?.expense_boards) return null;

    // Handle single board object
    if (!Array.isArray(user.expense_boards)) {
      return (
        <View
          key={user.expense_boards.name}
          style={[
            styles.badge,
            { 
              backgroundColor: theme.badge.board.background,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4
            },
          ]}
        >
          <MaterialCommunityIcons
            name="clipboard-list-outline"
            size={14}
            color={theme.badge.board.text}
          />
          <Text style={[styles.badgeText, { color: theme.badge.board.text }]}>
            {user.expense_boards.name}
          </Text>
          {user.total_expense > 0 && (
            <Text style={[styles.badgeText, { color: theme.badge.board.text, opacity: 0.7 }]}>
              • {user.total_expense}
            </Text>
          )}
        </View>
      );
    }

    // Handle array of boards
    return user.expense_boards.map((board, index) => (
      <View
        key={`${board.name}-${index}`}
        style={[
          styles.badge,
          { 
            backgroundColor: theme.badge.board.background,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4
          },
        ]}
      >
        <MaterialCommunityIcons
          name="clipboard-list-outline"
          size={14}
          color={theme.badge.board.text}
        />
        <Text style={[styles.badgeText, { color: theme.badge.board.text }]}>
          {board.name}
        </Text>
      </View>
    ));
  }

  const renderUserCard = (user) => (
    <View
      key={user.id}
      style={[
        styles.inviteCard,
        {
          backgroundColor: theme.inviteCard.background,
          borderColor: theme.inviteCard.border,
          shadowColor: theme.inviteCard.shadow,
        },
      ]}
    >
      {user?.is_accepted && (
        <View
          style={[
            styles.checkmarkContainer,
            {
              backgroundColor: theme.checkmark.background,
              shadowColor: theme.checkmark.shadow,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="check-decagram"
            size={24}
            color={theme.checkmark.icon}
          />
        </View>
      )}
      <View style={styles.inviteCardContent}>
        <View style={styles.avatarAndInfo}>
          <View
            style={[
              styles.avatarCircle,
              {
                backgroundColor: getAvatarColor(
                  user?.profiles?.email_address || ""
                ),
                shadowColor: theme.avatar.shadow,
              },
            ]}
          >
            <Text style={[styles.avatarInitials, { color: theme.avatar.text }]}>
              {getInitials(user?.profiles?.full_name)}
            </Text>
          </View>
          <View style={styles.userInfoContainer}>
            <View style={styles.nameContainer}>
              <Text style={[styles.inviteName, { color: theme.text }]}>
                {user?.profiles?.full_name || "No name"}
              </Text>
            </View>
            <Text
              style={[
                styles.inviteEmail,
                {
                  color: user?.is_accepted ? theme.success : theme.error,
                  marginBottom: 0,
                  fontSize: 12,
                  fontWeight: "800",
                },
              ]}
            >
              {user?.status.charAt(0).toUpperCase() + user?.status.slice(1) ||
                "Pending"}
            </Text>
            <Text style={[styles.inviteEmail, { color: theme.textSecondary }]}>
              {user?.profiles?.email_address || "No email"}
            </Text>
          </View>
        </View>
        <View style={styles.badgeContainer}>
          {getStatusBadge(user)}
        
          {getBoardBadge(user)}
        </View>
        {!user?.is_accepted && (
          <View style={[styles.actionContainer]}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: theme.button.reject.background,
                    shadowColor: theme.inviteCard.shadow,
                  },
                ]}
                onPress={() => handleRejectInvitation(user.id)}
                disabled={isUpdating}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: theme.button.reject.text },
                  ]}
                >
                  Reject
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: theme.button.accept.background,
                    shadowColor: theme.inviteCard.shadow,
                  },
                ]}
                onPress={() => handleAcceptInvitation(user.id)}
                disabled={isUpdating}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: theme.button.accept.text },
                  ]}
                >
                  Accept
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <Header title="Invitees" onBack={() => navigation.goBack()} />
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
      <Header title="Invitees" onBack={() => navigation.goBack()} />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sharedUsers.length > 0 ? (
          sharedUsers.map((user) => renderUserCard(user))
        ) : (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons
              name="account-group"
              size={64}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
              No Invitations
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
  container: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 18,
    marginLeft: 2,
  },
  inviteCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
  inviteCardContent: {
    padding: 20,
  },
  avatarAndInfo: {
    flexDirection: "row",
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarInitials: {
    fontWeight: "600",
    fontSize: 20,
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  inviteName: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
    letterSpacing: 0.2,
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  inviteEmail: {
    fontSize: 15,
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  actionContainer: {
    paddingVertical: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  checkmarkContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
    borderRadius: 16,
    padding: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 16,
    minHeight: 400,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.8,
    letterSpacing: 0.2,
  },
});
