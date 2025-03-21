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

const { width } = Dimensions.get("window");

// Dummy data for when no data is found
const dummyExpenses = [
  {
    id: 1,
    category: "Food",
    amount: 45.5,
    date: "2024-03-20T12:00:00",
    description: "Lunch at Restaurant",
  },
  {
    id: 2,
    category: "Transport",
    amount: 25.0,
    date: "2024-03-19T15:30:00",
    description: "Bus Ticket",
  },
  {
    id: 3,
    category: "Shopping",
    amount: 120.0,
    date: "2024-03-18T10:15:00",
    description: "Souvenirs",
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error.message);
      // Use dummy profile data if fetch fails
      setUserProfile({ full_name: "John Doe" });
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

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View>
          <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>
            Welcome back,
          </Text>
          <Text style={[styles.nameText, { color: theme.text }]}>
            {userProfile?.full_name || "John Doe"}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>
          <ThemeToggle />
        </View>
      </View>
    </View>
  );

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
        onPress={() => {
          /* Navigate to Add Trip */
        }}
      >
        <MaterialCommunityIcons
          name="plus-circle-outline"
          size={24}
          color={theme.primary}
        />
        <Text style={[styles.actionText, { color: theme.text }]}>Add Trip</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.card }]}
        onPress={() => {
          /* Navigate to Add Expense */
        }}
      >
        <MaterialCommunityIcons
          name="wallet-outline"
          size={24}
          color={theme.primary}
        />
        <Text style={[styles.actionText, { color: theme.text }]}>
          Add Expense
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.card }]}
        onPress={() => {
          /* Navigate to Analytics */
        }}
      >
        <MaterialCommunityIcons
          name="chart-pie"
          size={24}
          color={theme.primary}
        />
        <Text style={[styles.actionText, { color: theme.text }]}>
          Analytics
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderExpenses = () => (
    <View style={styles.expenses}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Recent Expenses
        </Text>
        <TouchableOpacity
          onPress={() => {
            /* Navigate to All Expenses */
          }}
        >
          <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
        </TouchableOpacity>
      </View>
      {expenses.slice(0, 4).map((expense) => (
        <TouchableOpacity
          key={expense.id}
          style={[styles.expenseItem, { backgroundColor: theme.card }]}
          onPress={() => {
            /* Navigate to Expense Details */
          }}
        >
          <View
            style={[
              styles.expenseIcon,
              { backgroundColor: `${theme.primary}20` },
            ]}
          >
            <MaterialCommunityIcons
              name="food"
              size={20}
              color={theme.primary}
            />
          </View>
          <View style={styles.expenseInfo}>
            <Text style={[styles.expenseName, { color: theme.text }]}>
              {expense.category}
            </Text>
            <Text style={[styles.expenseDate, { color: theme.textSecondary }]}>
              {new Date(expense.date).toLocaleDateString()}
            </Text>
          </View>
          <Text style={[styles.expenseAmount, { color: theme.text }]}>
            ${expense.amount.toFixed(2)}
          </Text>
        </TouchableOpacity>
      ))}
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {renderHeader()}
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderBalanceCard()}
        {renderQuickActions()}
        {renderExpenses()}
      </ScrollView>
      <FooterTab navigation={navigation} />
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
  expenses: {
    padding: 20,
    paddingBottom: 80, // Add padding for footer tab
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAll: {
    fontSize: 14,
  },
  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  expenseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  expenseName: {
    fontSize: 15,
    fontWeight: "500",
  },
  expenseDate: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 1,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: "bold",
  },
});
