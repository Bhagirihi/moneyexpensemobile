import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../config/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { expenseBoardService } from "../services/expenseBoardService";
import { expenseService } from "../services/expenseService";
import ThemeToggle from "../components/ThemeToggle";
import FooterTab from "../components/FooterTab";
import { Header } from "../components/Header";
import ExpenseList from "../components/ExpenseList";

const { width } = Dimensions.get("window");

// Dummy data for when no data is found
const dummyExpenses = [
  {
    id: 1,
    category: "Food",
    amount: 45.5,
    date: "2024-03-20T12:00:00",
    description: "Lunch at Restaurant",
    icon: "food",
    color: "#FF6B6B",
  },
  {
    id: 2,
    category: "Transport",
    amount: 25.0,
    date: "2024-03-19T15:30:00",
    description: "Bus Ticket",
    icon: "car",
    color: "#4ECDC4",
  },
  {
    id: 3,
    category: "Shopping",
    amount: 120.0,
    date: "2024-03-18T10:15:00",
    description: "Souvenirs",
    icon: "shopping",
    color: "#45B7D1",
  },
];

export const DashboardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [hasBoards, setHasBoards] = useState(false);
  const [stats, setStats] = useState({
    totalBudget: 0,
    totalExpenses: 0,
    remainingBudget: 0,
  });

  useEffect(() => {
    fetchUserProfile();
    fetchDashboardData();
  }, []);

  const fetchUserProfile = async () => {
    try {
      console.log("Fetching user profile...");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("User data from auth:", user);

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        console.log("User profile data:", data);
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error.message);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("Fetching dashboard data...");

      // Fetch expense boards
      const expenseBoards = await expenseBoardService.getExpenseBoards();
      console.log("Fetched expense boards:", expenseBoards);

      // Set whether user has any boards
      setHasBoards(expenseBoards.length > 0);

      // Calculate total budget and expenses from boards
      const totalBudget = expenseBoards.reduce(
        (sum, board) => sum + (board.total_budget || 0),
        0
      );
      const totalExpenses = expenseBoards.reduce(
        (sum, board) => sum + (board.totalExpenses || 0),
        0
      );
      const remainingBudget = totalBudget - totalExpenses;

      // Update stats
      setStats({
        totalBudget,
        totalExpenses,
        remainingBudget,
      });

      // Fetch recent transactions
      const { data: transactionsData } = await expenseService.getExpenses(
        null,
        1,
        4
      );
      console.log("Fetched recent transactions:", transactionsData);

      // Update expenses state with fetched transactions
      setExpenses(transactionsData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error.message);
      // Only clear expenses on error, keep other data
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const renderBalanceCard = () => (
    <View style={[styles.balanceCard, { backgroundColor: theme.primary }]}>
      <View style={styles.balanceMain}>
        <View style={styles.balanceRow}>
          <View style={styles.balanceLabelContainer}>
            <MaterialCommunityIcons
              name="wallet-outline"
              size={20}
              color={theme.white}
              style={styles.balanceIcon}
            />
            <Text style={[styles.balanceLabel, { color: theme.white }]}>
              Total Budget
            </Text>
          </View>
          <Text style={[styles.balanceValue, { color: theme.white }]}>
            ${stats.totalBudget.toFixed(2)}
          </Text>
        </View>

        <View style={styles.balanceRow}>
          <View style={styles.balanceLabelContainer}>
            <MaterialCommunityIcons
              name="cash-remove"
              size={20}
              color={theme.white}
              style={styles.balanceIcon}
            />
            <Text style={[styles.balanceLabel, { color: theme.white }]}>
              Spent
            </Text>
          </View>
          <Text style={[styles.balanceValue, { color: theme.white }]}>
            ${stats.totalExpenses.toFixed(2)}
          </Text>
        </View>

        <View style={[styles.balanceRow, styles.remainingRow]}>
          <View style={styles.balanceLabelContainer}>
            <MaterialCommunityIcons
              name="cash-check"
              size={20}
              color={theme.success}
              style={styles.balanceIcon}
            />
            <Text style={[styles.balanceLabel, { color: theme.success }]}>
              Remaining
            </Text>
          </View>
          <Text style={[styles.balanceValue, { color: theme.success }]}>
            ${stats.remainingBudget.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  (stats.totalExpenses / (stats.totalBudget || 1)) * 100
                }%`,
                backgroundColor: theme.success,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.white }]}>
          {Math.round((stats.totalExpenses / (stats.totalBudget || 1)) * 100)}%
          of budget used
        </Text>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate("ExpenseBoard")}
      >
        <MaterialCommunityIcons
          name="view-grid"
          size={24}
          color={theme.success}
        />
        <Text style={[styles.actionText, { color: theme.text }]}>Boards</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate("AddExpense")}
      >
        <MaterialCommunityIcons
          name="plus-circle-outline"
          size={24}
          color={theme.primary}
        />
        <Text style={[styles.actionText, { color: theme.text }]}>
          Add Expense
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate("Categories")}
      >
        <MaterialCommunityIcons name="tag" size={24} color={theme.warning} />
        <Text style={[styles.actionText, { color: theme.text }]}>
          Categories
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTransactionsSection = () => (
    <View style={styles.transactionsSection}>
      <ExpenseList
        expenses={expenses}
        title="Recent Transactions"
        onSeeAllPress={() => navigation.navigate("Expense")}
        onExpensePress={(expense) => {
          console.log("Expense pressed:", expense);
        }}
        showHeader={true}
        showAllButton={true}
        showEmptyState={true}
        navigation={navigation}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.profileSection}
          onPress={() => navigation.navigate("Profile")}
        >
          <View
            style={[
              styles.profileIconContainer,
              { backgroundColor: `${theme.primary}15` },
            ]}
          >
            {userProfile?.avatar_url ? (
              <Image
                source={{ uri: userProfile.avatar_url }}
                style={styles.smallProfileImage}
                resizeMode="cover"
              />
            ) : (
              <MaterialCommunityIcons
                name="account"
                size={24}
                color={theme.primary}
              />
            )}
          </View>
          <View>
            <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>
              Welcome back,
            </Text>
            <Text style={[styles.nameText, { color: theme.text }]}>
              {userProfile?.full_name || "Guest"}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Notification")}
            style={styles.notificationButton}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color={theme.text}
            />
            {userProfile?.has_notifications && (
              <View
                style={[
                  styles.notificationBadge,
                  { backgroundColor: theme.error },
                ]}
              />
            )}
          </TouchableOpacity>
          <ThemeToggle />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {renderHeader()}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderBalanceCard()}
        {renderQuickActions()}
        {renderTransactionsSection()}
      </ScrollView>
      <FooterTab navigation={navigation} activeRoute="Home" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 16,
    opacity: 0.7,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  notificationButton: {
    padding: 8,
    marginLeft: 8,
  },
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  balanceMain: {
    marginBottom: 15,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  remainingRow: {
    marginTop: 2,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  balanceLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceIcon: {
    marginRight: 8,
  },
  balanceLabel: {
    fontSize: 16,
    opacity: 0.9,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: 0,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.8,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: "center",
    padding: 15,
    borderRadius: 15,
    width: (width - 60) / 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
  },
  transactionsSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  seeAllButton: {
    padding: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  smallProfileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
