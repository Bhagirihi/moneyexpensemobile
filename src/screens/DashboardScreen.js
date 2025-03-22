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
import { tripService } from "../services/tripService";
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
  const [stats, setStats] = useState({
    totalBudget: 5000,
    totalExpenses: 190.5,
    remainingBudget: 4809.5,
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
      const [expensesData, statsData] = await Promise.all([
        tripService.getExpenses(),
        tripService.getDashboardStats(),
      ]);

      setExpenses(expensesData.length > 0 ? expensesData : dummyExpenses);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error.message);
      // Use dummy data if fetch fails
      setExpenses(dummyExpenses);
    } finally {
      setLoading(false);
    }
  };

  const renderBalanceCard = () => (
    <View style={[styles.balanceCard, { backgroundColor: theme.primary }]}>
      {/* <View style={styles.balanceHeader}>
        <Text style={[styles.balanceTitle, { color: theme.white }]}>
          Budget Overview
        </Text>
        <TouchableOpacity>
          <MaterialCommunityIcons
            name="eye-outline"
            size={24}
            color={theme.white}
          />
        </TouchableOpacity>
      </View> */}

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
                width: `${(stats.totalExpenses / stats.totalBudget) * 100}%`,
                backgroundColor: theme.success,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.white }]}>
          {Math.round((stats.totalExpenses / stats.totalBudget) * 100)}% of
          budget used
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

  const renderNavigationOptions = () => (
    <View style={styles.navigationSection}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        More Options
      </Text>
      <View style={styles.navigationGrid}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate("Analytics")}
        >
          <MaterialCommunityIcons
            name="chart-bar"
            size={24}
            color={theme.primary}
          />
          <Text style={[styles.navButtonText, { color: theme.text }]}>
            Analytics
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate("Analysis")}
        >
          <MaterialCommunityIcons
            name="chart-line"
            size={24}
            color={theme.success}
          />
          <Text style={[styles.navButtonText, { color: theme.text }]}>
            Analysis
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate("Notification")}
        >
          <MaterialCommunityIcons name="bell" size={24} color={theme.warning} />
          <Text style={[styles.navButtonText, { color: theme.text }]}>
            Notifications
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate("Profile")}
        >
          <MaterialCommunityIcons
            name="account"
            size={24}
            color={theme.error}
          />
          <Text style={[styles.navButtonText, { color: theme.text }]}>
            Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate("Settings")}
        >
          <MaterialCommunityIcons
            name="cog"
            size={24}
            color={theme.textSecondary}
          />
          <Text style={[styles.navButtonText, { color: theme.text }]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>
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
      {/* <Header
        title={userProfile?.full_name || "John Doe"}
        onBack={() => navigation.goBack()}
        rightComponent={renderRightSection()}
        showBack={false}
      /> */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderBalanceCard()}
        {renderQuickActions()}
        <ExpenseList
          expenses={expenses.slice(0, 4)}
          onSeeAllPress={() => navigation.navigate("Expense")}
          onExpensePress={(expense) => {
            console.log("Expense pressed:", expense);
          }}
        />
      </ScrollView>
      <FooterTab navigation={navigation} activeRoute="Home" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
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
  // headerRight: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   gap: 12,
  // },
  // notificationButton: {
  //   padding: 4,
  // },
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
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  balanceMain: {
    marginBottom: 15,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  remainingRow: {
    marginTop: 4,
    paddingTop: 8,
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
  navigationSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  navigationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  navButton: {
    width: "48%",
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  navButtonText: {
    marginTop: 8,
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
});
