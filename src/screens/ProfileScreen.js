import React, { useRef } from "react";
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
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components/Header";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const ProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  const renderProfileImage = () => (
    <View
      style={[
        styles.profileImageSection,
        { backgroundColor: theme.cardBackground },
      ]}
    >
      <View style={styles.profileRow}>
        <View style={styles.profileImageContainer}>
          <View
            style={[
              styles.profileImage,
              { backgroundColor: `${theme.primary}15` },
            ]}
          >
            <MaterialCommunityIcons
              name="account"
              size={50}
              color={theme.primary}
            />
            {/* Replace with Image component when there's a profile picture */}
            {/* <Image
              source={{ uri: profileImageUrl }}
              style={styles.profileImage}
              resizeMode="cover"
            /> */}
          </View>
          <TouchableOpacity
            style={[styles.editImageButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              // Handle image picker
            }}
          >
            <MaterialCommunityIcons name="camera" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileDetails}>
          <Text style={[styles.profileName, { color: theme.text }]}>Test</Text>
          <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
            test@yopmail.com
          </Text>
          <Text style={[styles.profilePhone, { color: theme.textSecondary }]}>
            +91 7874766500
          </Text>
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
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Premium Access
        </Text>
      </View>

      <View style={styles.subscriptionInfo}>
        <View style={styles.premiumRow}>
          <View
            style={[
              styles.planBadge,
              { backgroundColor: `${theme.primary}15` },
            ]}
          >
            <Text style={[styles.planValue, { color: theme.primary }]}>
              Free Plan
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.upgradePremiumButton,
              { backgroundColor: theme.primary },
            ]}
            onPress={() => {
              // Handle upgrade
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
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Account Connections
        </Text>
      </View>

      <View style={styles.connectionItem}>
        <View style={styles.connectionLeft}>
          <View
            style={[styles.socialIconContainer, { backgroundColor: "#DB4437" }]}
          >
            <MaterialCommunityIcons name="google" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={[styles.connectionText, { color: theme.text }]}>
              Google
            </Text>
            <Text style={[styles.connectionStatus, { color: theme.error }]}>
              × Not connected
            </Text>
          </View>
        </View>
        <View style={styles.connectionRight}>
          <TouchableOpacity
            style={[styles.connectButton, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Account Statistics
        </Text>
      </View>

      <View style={styles.statsGrid}>
        {[
          { label: "Member Since", value: "17/03/2025" },
          { label: "Last Login", value: "19/03/2025" },
          { label: "Account Status", value: "Active", isSuccess: true },
        ].map((stat, index) => (
          <View key={index} style={styles.statsItem}>
            <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
              {stat.label}
            </Text>
            <Text
              style={[
                styles.statsValue,
                { color: stat.isSuccess ? theme.success : theme.text },
              ]}
            >
              {stat.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title="Profile"
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            onPress={() => {}}
            style={[
              styles.editButton,
              { backgroundColor: `${theme.primary}15` },
            ]}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={18}
              color={theme.primary}
            />
            <Text style={[styles.editButtonText, { color: theme.primary }]}>
              Edit Profile
            </Text>
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

        {renderSubscriptionStatus()}
        {renderAccountConnections()}
        {renderAccountStatistics()}
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
  profileImageSection: {
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
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
    width: 90,
    height: 90,
    borderRadius: 45,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#007AFF",
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
    gap: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
  },
  profileEmail: {
    fontSize: 14,
    fontWeight: "500",
  },
  profilePhone: {
    fontSize: 14,
    fontWeight: "500",
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
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  socialIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  infoContainer: {
    gap: 20,
  },
  infoItem: {
    gap: 6,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  subscriptionInfo: {
    marginTop: 12,
  },
  premiumRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  planValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  upgradePremiumButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  upgradeIcon: {
    marginRight: 4,
  },
  upgradePremiumText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  connectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
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
  statsGrid: {
    marginTop: 12,
    gap: 16,
  },
  statsItem: {
    gap: 6,
  },
  statsLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  statsValue: {
    fontSize: 16,
    fontWeight: "600",
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
});
