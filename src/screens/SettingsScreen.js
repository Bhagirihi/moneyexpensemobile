import React, { useState, useEffect } from "react";
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
  Share,
  Clipboard,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { Header } from "../components/Header";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ThemeToggle from "../components/ThemeToggle";
import { supabase } from "../config/supabase";
import { showToast } from "../utils/toast";
import { formatCurrency } from "../utils/formatters";
import { realTimeSync } from "../services/realTimeSync";
import { expenseBoardService } from "../services/expenseBoardService";
import { useAuth } from "../context/AuthContext";

export const SettingsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { language, currency, updateLanguage, updateCurrency } =
    useAppSettings();
  const { session } = useAuth();
  const [budget, setBudget] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [boardCount, setBoardCount] = useState(0);
  const [expenseBoards, setExpenseBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareAppModal, setShowShareAppModal] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [boardName, setBoardName] = useState("");
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [boardID, updateBoard] = useState("");
  const [userID, setUserID] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [sharedMembers, setSharedMembers] = useState([]);
  // Sample data - Replace with actual data from your backend
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
  ];

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$", conversionRate: 1 },
    { code: "EUR", name: "Euro", symbol: "€", conversionRate: 0.92 },
    { code: "GBP", name: "British Pound", symbol: "£", conversionRate: 0.79 },
    { code: "INR", name: "Indian Rupee", symbol: "₹", conversionRate: 83.12 },
    {
      code: "AUD",
      name: "Australian Dollar",
      symbol: "A$",
      conversionRate: 1.5,
    },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$", conversionRate: 1.3 },
    {
      code: "NZD",
      name: "New Zealand Dollar",
      symbol: "NZ$",
      conversionRate: 1.4,
    },
    {
      code: "SGD",
      name: "Singapore Dollar",
      symbol: "S$",
      conversionRate: 1.35,
    },
    {
      code: "HKD",
      name: "Hong Kong Dollar",
      symbol: "HK$",
      conversionRate: 7.8,
    },
  ];

  useEffect(() => {
    fetchData();
    generateReferralCode();

    // Store the subscription cleanup function
    const cleanup = realTimeSync.subscribeToProfile(fetchData);

    // Return a proper cleanup function
    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch monthly budget
      const { data: budgetData, error: budgetError } = await supabase
        .from("profiles")
        .select("*")
        .single();
      const sharedMembers = await expenseBoardService.getSharedMembers();

      if (budgetError) throw budgetError;
      console.log("budgetData", budgetData);
      setUserID(budgetData.id);
      setBudget(budgetData);
      setBoardCount(budgetData.total_boards);
      // setBoardName(budgetData.board_id);
      setMonthlyBudget(budgetData.default_board_budget);
      setReferralCode(budgetData.referral_code);
      setSharedMembers(sharedMembers);
      setIs2FAEnabled(budgetData.is2FA);
      // Fetch expense boards
      const { data: boardsData, error: boardsError } = await supabase
        .from("expense_boards")
        .select(`*`);

      const board = await boardsData.find((b) => b.id === budgetData.board_id);
      const isDefaultBoard = await boardsData.find((b) => b.is_default);

      if (isDefaultBoard) {
        updateBoard(board.id);
      }
      if (board) {
        setBoardName(board.name);
      } else {
        console.log("Board not found for the given ID");
      }
      if (boardsError) throw boardsError;

      setExpenseBoards(boardsData || []);
    } catch (error) {
      console.error("Error fetching data: <-", error);
      showToast.error("Error", "Failed to load settings data");
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const code = user.id.substring(0, 8).toUpperCase();
        setReferralCode(code);
      }
    } catch (error) {
      console.error("Error generating referral code:", error);
    }
  };

  const handleShareApp = async (method) => {
    try {
      const message = `Join Trivense - The Smart Expense Tracking App!\n\nUse my referral code: ${referralCode}\n\nDownload now: https://trivense.app/download?invite=${referralCode}\n\nTrack your expenses smarter with Trivense!`;

      let result;

      if (method === "email" || method === "social") {
        result = await Share.share({
          message,
          ...(method === "email" && {
            subject: "Join Trivense - Smart Expense Tracking",
          }),
        });

        if (result.action === Share.sharedAction) {
          showToast.success("Thanks for Sharing!", "Your invite was shared 🎉");
          console.log("User shared the invite", result);
        } else if (result.action === Share.dismissedAction) {
          // Optional: silently ignore or log
          console.log("User dismissed the share dialog.");
        }
      } else if (method === "copy") {
        await Clipboard.setStringAsync(referralCode);
        showToast.success("Copied!", "Referral code copied to clipboard 📋");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      showToast.error("Error", "Failed to share. Please try again.");
    }
  };

  const handleUpdateBudget = async () => {
    try {
      const newBudget = parseFloat(editValue);
      if (isNaN(newBudget) || newBudget < 0) {
        showToast.error("Error", "Please enter a valid budget amount");
        return;
      }

      const { error } = await supabase
        .from("monthly_budgets")
        .upsert({ amount: newBudget });

      if (error) throw error;

      setMonthlyBudget(newBudget);
      setEditModalVisible(false);
      showToast.success("Success", "Monthly budget updated successfully");
    } catch (error) {
      console.error("Error updating budget:", error);
      showToast.error("Error", "Failed to update monthly budget");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditValue(item.subtitle || "");
    if (item.title === "Share With") {
      setShowShareAppModal(true);
    } else {
      setEditModalVisible(true);
    }
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

  const updateDefaultBoard = async (boardID) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ board_id: boardID })
        .eq("id", userID);
      if (error) throw error;
      updateBoard(boardID);
      setEditModalVisible(false);
      showToast.success("Success", "Default board updated successfully");
      fetchData();
    } catch (error) {
      console.error("Error updating default board:", error);
      showToast.error("Error", "Failed to update default board");
    }
  };

  const handlePasswordReset = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Validate passwords
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match");
        return;
      }

      if (newPassword.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }

      // First, reauthenticate the user with their current password
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: currentPassword,
      });

      if (reauthError) {
        setError("Current password is incorrect");
        return;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
      setEditModalVisible(false);
      showToast.success("Password updated successfully");

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handle2FAToggle = async (value) => {
    try {
      setLoading(true);
      // Here you would typically make an API call to update 2FA status
      // For now, we'll just update the local state
      setIs2FAEnabled(value);

      const { error } = await supabase
        .from("profiles")
        .update({ is2FA: value })
        .eq("id", userID);

      if (value) {
        showToast.success("Two-factor authentication enabled");
      } else {
        showToast.success("Two-factor authentication disabled");
      }
    } catch (error) {
      console.error("Error updating 2FA status:", error);
      showToast.error("Failed to update two-factor authentication status");
      // Revert the switch if the update fails
      setIs2FAEnabled(!value);
    } finally {
      setLoading(false);
    }
  };

  const getConvertedPrice = (basePrice, currencyCode) => {
    const selectedCurrency = currencies.find(
      (curr) => curr.code === currencyCode
    );
    if (!selectedCurrency) return { amount: basePrice, symbol: "₹" };

    const convertedAmount = basePrice * selectedCurrency.conversionRate;
    return {
      amount: convertedAmount.toFixed(2),
      symbol: selectedCurrency.symbol,
    };
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
            { borderBottomColor: theme.borderLight },
          ]}
          onPress={() => {
            updateLanguage(lang.code);
            setEditModalVisible(false);
          }}
        >
          <Text style={[styles.selectorItemText, { color: theme.text }]}>
            {lang.name}
          </Text>
          {lang.code === language && (
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
      {currencies.map((curr) => (
        <TouchableOpacity
          key={curr.code}
          style={[
            styles.selectorItem,
            { borderBottomColor: theme.borderLight },
          ]}
          onPress={() => {
            updateCurrency(curr.code);
            setEditModalVisible(false);
          }}
        >
          <Text style={[styles.selectorItemText, { color: theme.text }]}>
            {curr.symbol} {curr.name} ({curr.code})
          </Text>
          {curr.code === currency && (
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

  const renderDefaultBoardSelector = () => (
    <View
      style={[
        styles.selectorContent,
        { backgroundColor: theme.cardBackground },
      ]}
    >
      <Text style={[styles.modalTitle, { color: theme.text }]}>
        Default Board
      </Text>
      {expenseBoards.map((board) => (
        <TouchableOpacity
          key={board.id}
          style={[
            styles.selectorItem,
            { borderBottomColor: theme.borderLight },
          ]}
          onPress={() => {
            updateDefaultBoard(board.id);
          }}
        >
          <Text style={[styles.selectorItemText, { color: theme.text }]}>
            {board.name}
          </Text>
          {board.id === boardID && (
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

  const renderBudgetEditor = () => {
    return (
      <View
        style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}
      >
        <Text style={[styles.modalTitle, { color: theme.text }]}>
          Set Board Budget
        </Text>
        <View style={styles.dropdownContainer}>
          <Text style={[styles.dropdownLabel, { color: theme.text }]}>
            Select Board
          </Text>
          <TouchableOpacity
            style={[styles.dropdown, { backgroundColor: theme.card }]}
            onPress={() => setShowBoardDropdown(!showBoardDropdown)}
          >
            <Text style={[styles.dropdownText, { color: theme.text }]}>
              {selectedBoard ? selectedBoard.name : "Choose a board"}
            </Text>
            <MaterialCommunityIcons
              name={showBoardDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
          {showBoardDropdown && (
            <View
              style={[styles.dropdownList, { backgroundColor: theme.card }]}
            >
              {expenseBoards.map((board) => (
                <TouchableOpacity
                  key={board.id}
                  style={[
                    styles.dropdownItem,
                    {
                      backgroundColor:
                        selectedBoard?.id === board.id
                          ? theme.primaryLight
                          : "transparent",
                    },
                  ]}
                  onPress={() => {
                    setSelectedBoard(board);

                    setEditValue(board.total_budget?.toString() || "");
                    setShowBoardDropdown(false);
                  }}
                >
                  <Text
                    style={[styles.dropdownItemText, { color: theme.text }]}
                  >
                    {board.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        {selectedBoard && (
          <View style={styles.budgetInputContainer}>
            <Text style={[styles.budgetLabel, { color: theme.text }]}>
              Budget Amount
            </Text>
            <TextInput
              style={[styles.budgetInput, { color: theme.text }]}
              value={selectedBoard.budget?.toString() || ""}
              onChangeText={(value) => {
                const newBudget = parseFloat(value);
                if (!isNaN(newBudget)) {
                  setExpenseBoards((prevBoards) =>
                    prevBoards.map((board) =>
                      board.id === selectedBoard.id
                        ? { ...board, budget: newBudget }
                        : board
                    )
                  );
                  setSelectedBoard((prev) => ({ ...prev, budget: newBudget }));
                }
              }}
              keyboardType="numeric"
              placeholder="Enter budget"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
        )}
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: theme.errorLight }]}
            onPress={() => setEditModalVisible(false)}
          >
            <Text style={[styles.modalButtonText, { color: theme.error }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: theme.primary }]}
            onPress={handleApplyBudgets}
          >
            <Text style={[styles.modalButtonText, { color: "#FFFFFF" }]}>
              Apply
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: theme.primary }]}
            onPress={handleApplyAllBudgets}
          >
            <Text style={[styles.modalButtonText, { color: "#FFFFFF" }]}>
              Apply All
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleApplyBudgets = async () => {
    if (!selectedBoard) {
      showToast.error("Error", "Please select a board first");
      return;
    }

    console.log("Selected Board:", {
      id: selectedBoard.id,
      name: selectedBoard.name,
      newBudget: selectedBoard.budget,
    });

    try {
      const { error } = await supabase
        .from("expense_boards")
        .update({
          total_budget: selectedBoard.budget || 0,
        })
        .eq("id", selectedBoard.id);

      if (error) throw error;

      showToast.success("Success", "Board budget updated successfully");
      setEditModalVisible(false);
    } catch (error) {
      console.error("Error updating board budget:", error);
      showToast.error("Error", "Failed to update board budget");
    }
  };

  const handleApplyAllBudgets = async () => {
    Alert.alert(
      "Confirm Apply All",
      `Are you sure you want to apply the ${selectedBoard.budget} budget to all boards?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Apply All",
          onPress: async () => {
            try {
              for (const newboard of expenseBoards) {
                const { error, data } = await supabase
                  .from("expense_boards")
                  .update({ total_budget: selectedBoard.budget || 0 })
                  .eq("id", newboard.id);

                if (error) throw error;
              }

              showToast.success(
                "Success",
                "All board budgets updated successfully"
              );
              setEditModalVisible(false);
            } catch (error) {
              console.error("Error applying all budgets:", error);
              showToast.error("Error", "Failed to apply all budgets");
            }
          },
        },
      ]
    );
  };

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
      {expenseBoards.slice(-3).map((board) => {
        const members =
          sharedMembers?.filter((member) => member.board_id === board.id) || [];

        return (
          <View key={board.id} style={styles.boardDetailItem}>
            <View style={styles.boardDetailHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.primaryLight },
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
              <Text
                style={[styles.memberCount, { color: theme.textSecondary }]}
              >
                {members.length} members
              </Text>
            </View>

            <View style={styles.memberList}>
              {members.map((member) => (
                <Text
                  key={member.id}
                  style={[styles.memberEmail, { color: theme.textSecondary }]}
                >
                  {member.shared_with || "Unknown"}
                </Text>
              ))}
            </View>
          </View>
        );
      })}
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
          {
            icon: "account-multiple-plus",
            title: "Share Boards",
            desc: "Easily collaborate with others",
          },
          {
            icon: "robot",
            title: "AI Expense Analysis",
            desc: "Smart insights from your sheets coming soon!",
          },
        ].map((feature, index) => (
          <View key={index} style={styles.premiumFeatureItem}>
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: theme.primaryLight },
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
        {(() => {
          const { amount, symbol } = getConvertedPrice(1.2, currency);
          return (
            <>
              <Text style={[styles.priceAmount, { color: theme.text }]}>
                {symbol}
                {amount}
              </Text>
              <Text
                style={[styles.pricePeriod, { color: theme.textSecondary }]}
              >
                /month
              </Text>
            </>
          );
        })()}
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
      {error && (
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
      )}
      {success && (
        <Text style={[styles.successText, { color: theme.success }]}>
          Password updated successfully!
        </Text>
      )}
      <TextInput
        style={[
          styles.modalInput,
          {
            color: theme.text,
            borderColor: theme.textLight,
            backgroundColor: theme.inputBackground,
          },
        ]}
        placeholder="Current Password"
        placeholderTextColor={theme.textSecondary}
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <TextInput
        style={[
          styles.modalInput,
          {
            color: theme.text,
            borderColor: theme.textLight,
            backgroundColor: theme.inputBackground,
          },
        ]}
        placeholder="New Password"
        placeholderTextColor={theme.textSecondary}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={[
          styles.modalInput,
          {
            color: theme.text,
            borderColor: theme.textLight,
            backgroundColor: theme.inputBackground,
          },
        ]}
        placeholder="Confirm New Password"
        placeholderTextColor={theme.textSecondary}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: theme.errorLight }]}
          onPress={() => {
            setEditModalVisible(false);
            setError(null);
            setSuccess(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          }}
        >
          <Text style={[styles.modalButtonText, { color: theme.error }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: theme.primary }]}
          onPress={handlePasswordReset}
          disabled={loading}
        >
          <Text style={[styles.modalButtonText, { color: "#FFFFFF" }]}>
            {loading ? "Updating..." : "Reset"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEditModal = () => {
    if (!editModalVisible) return null;

    let modalContent;
    console.log("editingItem <-", editingItem);
    switch (editingItem?.title) {
      case "Language":
        modalContent = renderLanguageSelector();
        break;
      case "Currency":
        modalContent = renderCurrencySelector();
        break;
      case "Default Board":
        modalContent = renderDefaultBoardSelector();
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

  const renderShareAppModal = () => (
    <Modal
      visible={showShareAppModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowShareAppModal(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Share Trivense
            </Text>
            <TouchableOpacity onPress={() => setShowShareAppModal(false)}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.shareContent}>
            <View style={styles.appInfo}>
              <View
                style={[
                  styles.appIcon,
                  { backgroundColor: theme.primaryLight },
                ]}
              >
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={32}
                  color={theme.primary}
                />
              </View>
              <Text style={[styles.appName, { color: theme.text }]}>
                Trivense
              </Text>
            </View>

            <View style={styles.codeContainer}>
              <Text style={[styles.codeLabel, { color: theme.textSecondary }]}>
                Your Referral Code
              </Text>
              <View style={[styles.codeBox, { backgroundColor: theme.card }]}>
                <Text style={[styles.codeText, { color: theme.text }]}>
                  {referralCode}
                </Text>
                <TouchableOpacity onPress={() => handleShareApp("copy")}>
                  <MaterialCommunityIcons
                    name="content-copy"
                    size={20}
                    color={theme.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.shareOptions}>
              <TouchableOpacity
                style={[styles.shareOption, { backgroundColor: theme.card }]}
                onPress={() => handleShareApp("email")}
              >
                <MaterialCommunityIcons
                  name="email"
                  size={24}
                  color={theme.primary}
                />
                <Text style={[styles.shareOptionText, { color: theme.text }]}>
                  Share via Email
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shareOption, { backgroundColor: theme.card }]}
                onPress={() => handleShareApp("social")}
              >
                <MaterialCommunityIcons
                  name="share-variant"
                  size={24}
                  color={theme.primary}
                />
                <Text style={[styles.shareOptionText, { color: theme.text }]}>
                  Share via Social Apps
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderSettingItem = ({
    icon,
    title,
    subtitle,
    rightComponent,
    onPress,
    showBorder = true,
    editable = true,
    isSwitch = false,
    switchValue,
    onSwitchChange,
  }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        showBorder && {
          borderBottomWidth: 1,
          borderBottomColor: theme.borderLight,
        },
      ]}
      onPress={onPress}
      disabled={!editable && !onPress}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.primaryLight },
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
        {isSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: theme.borderLight, true: theme.primary }}
            thumbColor={theme.background}
            ios_backgroundColor={theme.borderLight}
          />
        ) : editable ? (
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
        {React.Children.map(children, (child, index) =>
          React.cloneElement(child, { key: `${title}-${index}` })
        )}
      </View>
    </View>
  );

  const renderBoardListWithInput = () => (
    <View style={styles.boardListContainer}>
      {expenseBoards.map((board) => (
        <View key={board.id} style={styles.boardItemContainer}>
          <Text style={[styles.boardName, { color: theme.text }]}>
            {board.name}
          </Text>
          <TextInput
            style={[styles.amountInput, { color: theme.text }]}
            value={board.budget?.toString() || ""}
            onChangeText={(value) => {
              const newBudget = parseFloat(value);
              if (!isNaN(newBudget)) {
                setExpenseBoards((prevBoards) =>
                  prevBoards.map((b) =>
                    b.id === board.id ? { ...b, budget: newBudget } : b
                  )
                );
              }
            }}
            keyboardType="numeric"
            placeholder="Enter amount"
            placeholderTextColor={theme.textSecondary}
          />
        </View>
      ))}
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
              subtitle:
                languages.find((lang) => lang.code === language)?.name ||
                "English",
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
              subtitle: `${
                currencies.find((curr) => curr.code === currency)?.symbol
              } ${currencies.find((curr) => curr.code === currency)?.name}`,
              onPress: () => handleEdit({ title: "Currency" }),
            }),
            renderSettingItem({
              icon: "view-dashboard-outline",
              title: "Default Board",
              subtitle: `${boardName}`,
              onPress: () => handleEdit({ title: "Default Board" }),
              editable: false,
            }),
            renderSettingItem({
              icon: "wallet-outline",
              title: "Monthly Budget",
              subtitle: formatCurrency(monthlyBudget),
              onPress: () => handleEdit({ title: "Monthly Budget" }),
            }),

            renderSettingItem({
              icon: "view-dashboard-outline",
              title: "Expense Board",
              subtitle: `${boardCount} Boards • ${sharedMembers?.length} Members`,
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
              editable: false,
            }),
            renderSettingItem({
              icon: "crown",
              title: "Premium Access",
              subtitle: "Upgrade premium to unlock all features",
              onPress: () => handleEdit({ title: "Premium Access" }),
              showBorder: false,
              editable: false,
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
              isSwitch: true,
              switchValue: is2FAEnabled,
              onSwitchChange: handle2FAToggle,
              editable: false,
            }),
            renderSettingItem({
              icon: "lock-reset",
              title: "Reset Password",
              onPress: () => handleEdit({ title: "Reset Password" }),
              showBorder: false,
              editable: false,
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
              editable: false,
            }),
            renderSettingItem({
              icon: "download-outline",
              title: "Export to Local Storage",
              subtitle: "Download your expense data",
              onPress: () => {},
              editable: false,
            }),
            renderSettingItem({
              icon: "share-variant-outline",
              title: "Share With",
              subtitle: "Share Trivense with friends",
              onPress: () => handleEdit({ title: "Share With" }),
              showBorder: false,
              editable: false,
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
              editable: false,
            }),
            // renderSettingItem({
            //   icon: "information-outline",
            //   title: "Font Test",
            //   subtitle: "Test the fonts",
            //   showBorder: false,
            //   editable: true,
            //   onPress: () => navigation.navigate("FontTest"),
            // }),
          ],
        })}

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.errorLight }]}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={20} color={theme.error} />
          <Text style={[styles.logoutText, { color: theme.error }]}>
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
      {renderEditModal()}
      {renderShareAppModal()}
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
    borderWidth: 1,
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
    marginBottom: 20,
  },
  budgetLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  budgetInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: (theme) => theme.borderLight,
    fontSize: 16,
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
    // marginBottom: 20,
    padding: 10,
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
  shareContent: {
    padding: 8,
  },
  appInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: "600",
  },
  codeContainer: {
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 16,
    fontFamily: "monospace",
  },
  shareOptions: {
    gap: 12,
  },
  shareOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  shareOptionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownContainer: {
    marginBottom: 20,
    position: "relative",
    zIndex: 1,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: (theme) => theme.borderLight,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: (theme) => theme.borderLight,
    maxHeight: 200,
    overflow: "scroll",
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: (theme) => theme.borderLight,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  boardListContainer: {
    marginBottom: 20,
  },
  boardItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: (theme) => theme.borderLight,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    padding: 8,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  successText: {
    color: "green",
    marginBottom: 10,
  },
});
