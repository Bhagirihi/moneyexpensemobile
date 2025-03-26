import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Switch,
  Platform,
  TextInput,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components/Header";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ThemeToggle from "../components/ThemeToggle";
import { supabase } from "../config/supabase";
import { showToast } from "../utils/toast";

export const SettingsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Sample data - Replace with actual data from your backend
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
  ];

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
  ];

  const boards = [
    { id: 1, name: "Personal", shared: [{ email: "john@example.com" }] },
    {
      id: 2,
      name: "Family",
      shared: [
        { email: "sarah@example.com" },
        { email: "mike@example.com" },
        { email: "lisa@example.com" },
      ],
    },
    {
      id: 3,
      name: "Work",
      shared: [
        { email: "boss@company.com" },
        { email: "team@company.com" },
        { email: "finance@company.com" },
        { email: "admin@company.com" },
      ],
    },
  ];

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditValue(item.subtitle || "");
    setEditModalVisible(true);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        showToast.error("Error", "Failed to log out. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      showToast.error(
        "Error",
        "An unexpected error occurred. Please try again."
      );
    }
  };

  const renderLanguageSelector = () => (
    <View
      style={[
        styles.selectorContent,
        { backgroundColor: theme.cardBackground },
      ]}
    >
      <Text style={[styles.modalTitle, { color: theme.text }]}>
        Select Language
      </Text>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.selectorItem,
            { borderBottomColor: `${theme.text}15` },
          ]}
          onPress={() => {
            // Handle language selection
            setEditModalVisible(false);
          }}
        >
          <Text style={[styles.selectorItemText, { color: theme.text }]}>
            {lang.name}
          </Text>
          {lang.code === "en" && (
            <MaterialCommunityIcons
              name="check"
              size={20}
              color={theme.primary}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCurrencySelector = () => (
    <View
      style={[
        styles.selectorContent,
        { backgroundColor: theme.cardBackground },
      ]}
    >
      <Text style={[styles.modalTitle, { color: theme.text }]}>
        Select Currency
      </Text>
      {currencies.map((currency) => (
        <TouchableOpacity
          key={currency.code}
          style={[
            styles.selectorItem,
            { borderBottomColor: `${theme.text}15` },
          ]}
          onPress={() => {
            // Handle currency selection
            setEditModalVisible(false);
          }}
        >
          <Text style={[styles.selectorItemText, { color: theme.text }]}>
            {currency.symbol} {currency.name} ({currency.code})
          </Text>
          {currency.code === "USD" && (
            <MaterialCommunityIcons
              name="check"
              size={20}
              color={theme.primary}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderBudgetEditor = () => (
    <View
      style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}
    >
      <Text style={[styles.modalTitle, { color: theme.text }]}>
        Set Monthly Budget
      </Text>
      <View style={styles.budgetInputContainer}>
        <Text style={[styles.currencySymbol, { color: theme.text }]}>$</Text>
        <TextInput
          style={[styles.budgetInput, { color: theme.text }]}
          value={editValue}
          onChangeText={setEditValue}
          keyboardType="numeric"
          placeholder="Enter amount"
          placeholderTextColor={theme.textSecondary}
        />
      </View>
      <View style={styles.boardSelector}>
        <Text
          style={[styles.boardSelectorTitle, { color: theme.textSecondary }]}
        >
          Apply to Board
        </Text>
        {boards.map((board) => (
          <TouchableOpacity
            key={board.id}
            style={[styles.boardItem, { borderColor: theme.primary }]}
          >
            <Text style={[styles.boardName, { color: theme.text }]}>
              {board.name}
            </Text>
            <Text style={[styles.sharedCount, { color: theme.textSecondary }]}>
              {board.shared.length} members
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: theme.error + "15" }]}
          onPress={() => setEditModalVisible(false)}
        >
          <Text style={[styles.modalButtonText, { color: theme.error }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: theme.primary }]}
          onPress={() => {
            // Handle budget save
            setEditModalVisible(false);
          }}
        >
          <Text style={[styles.modalButtonText, { color: "#FFFFFF" }]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBoardDetails = () => (
    <View
      style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}
    >
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, { color: theme.text }]}>
          Expense Boards
        </Text>
        <TouchableOpacity onPress={() => setEditModalVisible(false)}>
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      </View>
      {boards.slice(-3).map((board) => (
        <View key={board.id} style={styles.boardDetailItem}>
          <View style={styles.boardDetailHeader}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${theme.primary}15` },
              ]}
            >
              <MaterialCommunityIcons
                name="view-dashboard-outline"
                size={22}
                color={theme.primary}
              />
            </View>
            <Text style={[styles.boardDetailName, { color: theme.text }]}>
              {board.name}
            </Text>
            <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
              {board.shared.length} members
            </Text>
          </View>
          <View style={styles.memberList}>
            {board.shared.map((member, index) => (
              <Text
                key={index}
                style={[styles.memberEmail, { color: theme.textSecondary }]}
              >
                {member.email}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderPremiumFeatures = () => (
    <View
      style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}
    >
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, { color: theme.text }]}>
          Premium Features
        </Text>
        <TouchableOpacity onPress={() => setEditModalVisible(false)}>
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.premiumFeatures}>
        {[
          {
            icon: "chart-line",
            title: "Advanced Analytics",
            desc: "Detailed insights and reports",
          },
          {
            icon: "sync",
            title: "Unlimited Sync",
            desc: "Sync across all devices",
          },
          {
            icon: "backup-restore",
            title: "Cloud Backup",
            desc: "Secure cloud storage",
          },
          {
            icon: "account-group",
            title: "Multiple Boards",
            desc: "Create unlimited boards",
          },
        ].map((feature, index) => (
          <View key={index} style={styles.premiumFeatureItem}>
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: `${theme.primary}15` },
              ]}
            >
              <MaterialCommunityIcons
                name={feature.icon}
                size={24}
                color={theme.primary}
              />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: theme.text }]}>
                {feature.title}
              </Text>
              <Text
                style={[styles.featureDesc, { color: theme.textSecondary }]}
              >
                {feature.desc}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.pricingSection}>
        <Text style={[styles.priceAmount, { color: theme.text }]}>$9.99</Text>
        <Text style={[styles.pricePeriod, { color: theme.textSecondary }]}>
          /month
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.upgradePremiumButton,
          { backgroundColor: theme.primary },
        ]}
        onPress={() => setEditModalVisible(false)}
      >
        <Text style={styles.upgradePremiumText}>Upgrade Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPasswordReset = () => (
    <View
      style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}
    >
      <Text style={[styles.modalTitle, { color: theme.text }]}>
        Reset Password
      </Text>
      <TextInput
        style={[
          styles.modalInput,
          { color: theme.text, backgroundColor: `${theme.text}10` },
        ]}
        placeholder="Current Password"
        placeholderTextColor={theme.textSecondary}
        secureTextEntry
      />
      <TextInput
        style={[
          styles.modalInput,
          { color: theme.text, backgroundColor: `${theme.text}10` },
        ]}
        placeholder="New Password"
        placeholderTextColor={theme.textSecondary}
        secureTextEntry
      />
      <TextInput
        style={[
          styles.modalInput,
          { color: theme.text, backgroundColor: `${theme.text}10` },
        ]}
        placeholder="Confirm New Password"
        placeholderTextColor={theme.textSecondary}
        secureTextEntry
      />
      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: theme.error + "15" }]}
          onPress={() => setEditModalVisible(false)}
        >
          <Text style={[styles.modalButtonText, { color: theme.error }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: theme.primary }]}
          onPress={() => {
            // Handle password reset
            setEditModalVisible(false);
          }}
        >
          <Text style={[styles.modalButtonText, { color: "#FFFFFF" }]}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEditModal = () => {
    if (!editModalVisible) return null;

    let modalContent;
    switch (editingItem?.title) {
      case "Language":
        modalContent = renderLanguageSelector();
        break;
      case "Currency":
        modalContent = renderCurrencySelector();
        break;
      case "Monthly Budget":
        modalContent = renderBudgetEditor();
        break;
      case "Premium Access":
        modalContent = renderPremiumFeatures();
        break;
      case "Reset Password":
        modalContent = renderPasswordReset();
        break;
      case "Expense Board":
        modalContent = renderBoardDetails();
        break;
      default:
        return null;
    }

    return (
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>{modalContent}</View>
      </Modal>
    );
  };

  const renderSettingItem = ({
    icon,
    title,
    subtitle,
    rightComponent,
    onPress,
    showBorder = true,
    editable = true,
  }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        showBorder && {
          borderBottomWidth: 1,
          borderBottomColor: `${theme.text}15`,
        },
      ]}
      onPress={() => {
        if (title === "Edit Profile") {
          navigation.navigate("Profile");
        } else if (editable || onPress) {
          handleEdit({ title, subtitle });
        }
      }}
      disabled={!editable && !onPress}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${theme.primary}15` },
          ]}
        >
          <MaterialCommunityIcons name={icon} size={22} color={theme.primary} />
        </View>
        <View style={styles.settingTexts}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.settingSubtitle, { color: theme.textSecondary }]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {editable ? (
          <MaterialCommunityIcons
            name="pencil"
            size={20}
            color={theme.textSecondary}
          />
        ) : (
          onPress && (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.textSecondary}
            />
          )
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        {title}
      </Text>
      <View
        style={[
          styles.sectionContent,
          { backgroundColor: theme.cardBackground },
        ]}
      >
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderSection({
          title: "Appearance",
          children: [
            renderSettingItem({
              icon: "theme-light-dark",
              title: "Dark Mode",
              subtitle: "Switch between light and dark themes",
              rightComponent: <ThemeToggle />,
              editable: false,
            }),
            renderSettingItem({
              icon: "translate",
              title: "Language",
              subtitle: "English",
              showBorder: false,
            }),
          ],
        })}

        {renderSection({
          title: "Expense Settings",
          children: [
            renderSettingItem({
              icon: "currency-usd",
              title: "Currency",
              subtitle: "USD - US Dollar",
            }),
            renderSettingItem({
              icon: "wallet-outline",
              title: "Monthly Budget",
              subtitle: "$5,000",
            }),
            renderSettingItem({
              icon: "view-dashboard-outline",
              title: "Expense Board",
              subtitle: `${boards.length} Boards • ${boards.reduce(
                (sum, board) => sum + board.shared.length,
                0
              )} Members`,
              onPress: () => handleEdit({ title: "Expense Board" }),
              editable: false,
              showBorder: false,
            }),
          ],
        })}

        {renderSection({
          title: "Account",
          children: [
            renderSettingItem({
              icon: "account-outline",
              title: "Edit Profile",
              onPress: () => navigation.navigate("Profile"),
            }),
            renderSettingItem({
              icon: "crown",
              title: "Premium Access",
              subtitle: "Upgrade to premium for more features",
              onPress: () => {},
              showBorder: false,
            }),
          ],
        })}

        {renderSection({
          title: "Security",
          children: [
            renderSettingItem({
              icon: "two-factor-authentication",
              title: "Two-Factor Authentication",
              subtitle: "Add extra security to your account",
              onPress: () => {},
            }),
            renderSettingItem({
              icon: "lock-reset",
              title: "Reset Password",
              onPress: () => {},
              showBorder: false,
            }),
          ],
        })}

        {renderSection({
          title: "Data Management",
          children: [
            renderSettingItem({
              icon: "cloud-upload-outline",
              title: "Backup to Google Drive",
              subtitle: "Sync and backup your expense data",
              onPress: () => {},
            }),
            renderSettingItem({
              icon: "download-outline",
              title: "Export to Local Storage",
              subtitle: "Download your expense data",
              onPress: () => {},
            }),
            renderSettingItem({
              icon: "share-variant-outline",
              title: "Shared With",
              subtitle: "Manage who can access your expense data",
              onPress: () => {},
              showBorder: false,
            }),
          ],
        })}

        {renderSection({
          title: "Support",
          children: [
            renderSettingItem({
              icon: "information-outline",
              title: "About",
              subtitle: "Version 1.0.0",
              showBorder: false,
            }),
          ],
        })}

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.error + "15" }]}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={20} color={theme.error} />
          <Text style={[styles.logoutText, { color: theme.error }]}>
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
      {renderEditModal()}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
  },
  sectionContent: {
    borderRadius: 16,
    overflow: "hidden",
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
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  settingTexts: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  modalInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  selectorContent: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  selectorItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  selectorItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  budgetInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "600",
    marginRight: 8,
  },
  budgetInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    padding: 8,
  },
  boardSelector: {
    marginBottom: 20,
  },
  boardSelectorTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  boardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  boardName: {
    fontSize: 16,
    fontWeight: "600",
  },
  sharedCount: {
    fontSize: 14,
  },
  premiumFeatures: {
    marginBottom: 24,
  },
  premiumFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
  },
  pricingSection: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 24,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: "700",
  },
  pricePeriod: {
    fontSize: 16,
    marginLeft: 4,
  },
  upgradePremiumButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  upgradePremiumText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  boardDetailItem: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: (theme) => `${theme.text}08`,
  },
  boardDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  boardDetailName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginLeft: 12,
  },
  memberCount: {
    fontSize: 14,
  },
  memberList: {
    marginLeft: 48,
  },
  memberEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
});
