import React, { useEffect, useState, useRef } from "react";
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
  RefreshControl,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { supabase } from "../config/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { expenseBoardService } from "../services/expenseBoardService";
import { expenseService } from "../services/expenseService";
import { dashboardService } from "../services/dashboardService";
import ThemeToggle from "../components/ThemeToggle";
import FooterTab from "../components/FooterTab";
import { Header } from "../components/Header";
import ExpenseList from "../components/ExpenseList";
import { showToast } from "../utils/toast";
import { capitalizeFirstLetter, formatCurrency } from "../utils/formatters";
import { notificationService } from "../services/notificationService";
import BalloonIllustration from "../components/BalloonIllustration";
import { realTimeSync } from "../services/realTimeSync";

const { width, height } = Dimensions.get("window");

export const DashboardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { currency } = useAppSettings();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [hasBoards, setHasBoards] = useState(false);
  const [stats, setStats] = useState({
    totalBudget: 0,
    totalExpenses: 0,
    remainingBudget: 0,
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Set up real-time subscriptions
  useEffect(() => {
    const cleanup = realTimeSync.subscribeToDashboard(fetchDashboardData);
    return cleanup;
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .single();

        if (error) {
          console.error("Error loading profile:", error);
          return;
        }

        if (profile) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();

    // Subscribe to profile changes
    const unsubscribeProfile = realTimeSync.subscribeToProfile(() => {
      loadProfile();
    });

    // Cleanup function
    return () => {
      unsubscribeProfile();
    };
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    const subscription = realTimeSync.subscribeToNotifications(() => {
      fetchUnreadCount();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) {
      // Fade and scale animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Continuous rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [loading]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchUserProfile(), fetchDashboardData()]);
    setRefreshing(false);
  }, []);

  const handleDeletePress = async (expenseId) => {
    try {
      await expenseService.deleteExpense(expenseId);
      const updatedExpenses = expenses.filter(
        (expense) => expense.id !== expenseId
      );
      setExpenses(updatedExpenses);
      memoizedCalculateMonthlyStats(updatedExpenses);
      showToast.success(
        "Expense deleted",
        "The expense has been successfully deleted"
      );
    } catch (error) {
      console.error("Error deleting expense:", error);
      showToast.error("Failed to delete expense", "Please try again later");
    }
  };

  const fetchDashboardData = async () => {
    try {
      //setLoading(true);

      // Fetch expense boards
      const expenseBoards = await expenseBoardService.getExpenseBoards();
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
      const { data: transactionsData, error: transactionsError } =
        await dashboardService.getRecentTransactions();

      if (transactionsError) {
        throw transactionsError;
      }

      setExpenses(transactionsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error.message);
      showToast.error("Failed to load dashboard data");
      setExpenses([]);
    } finally {
      // setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
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
            {formatCurrency(stats.totalBudget)}
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
            {formatCurrency(stats.totalExpenses)}
          </Text>
        </View>

        {/* <View style={[styles.balanceRow, styles.remainingRow]}>
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
            {formatCurrency(stats.remainingBudget)}
          </Text>
        </View> */}
      </View>

      <View style={styles.combinedProgressContainer}>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressLabel, { color: theme.white }]}>
            Budget Usage
          </Text>
          <Text style={[styles.progressLabel, { color: theme.white }]}>
            {`${Math.round(
              (stats.totalExpenses / (stats.totalBudget || 1)) * 100
            )}%`}
          </Text>
        </View>
        <View
          style={[
            styles.combinedProgressBar,
            { backgroundColor: "rgba(255, 255, 255, 0.2)" },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.round(
                  (stats.totalExpenses / (stats.totalBudget || 1)) * 100
                )}%`,
                backgroundColor: theme.error,
              },
            ]}
          />
          <View
            style={[
              styles.remainingFill,
              {
                width: `100%`,
                backgroundColor: theme.success,
              },
            ]}
          />
        </View>
        <View style={styles.progressLegend}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: theme.error }]}
            />
            <Text style={[styles.legendText, { color: theme.white }]}>
              Used
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: theme.success }]}
            />
            <Text style={[styles.legendText, { color: theme.white }]}>
              Remaining
            </Text>
          </View>
        </View>
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
        expenses={expenses.slice(0, 3)}
        title="Recent Transactions"
        onSeeAllPress={() => navigation.navigate("Expense")}
        onDeletePress={handleDeletePress}
        onExpensePress={(expense) => {}}
        showHeader={true}
        showAllButton={true}
        showEmptyState={true}
        navigation={navigation}
        maxItems={4}
        containerStyle={styles.transactionsList}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: "transparent" }]}
      >
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.illustrationContainer}>
            <Image
              source={require("../../assets/welcome.png")}
              style={styles.logo}
            />
            {/* <Animated.Text
              style={[
                styles.exploreText,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              Loading expenses...
            </Animated.Text> */}
          </View>
        </Animated.View>
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
              {capitalizeFirstLetter(userProfile?.full_name) || "Guest"}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Notification")}
            style={styles.notificationButton}
          >
            {unreadCount > 0 && (
              <View
                style={[
                  styles.notificationBadge,
                  { backgroundColor: theme.error },
                ]}
              >
                <Text style={styles.notificationCount}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {renderHeader()}
      {renderBalanceCard()}
      {renderQuickActions()}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.card }]}
        onPress={async () => {
          try {
            // Get all boards
            const { data: boards, error: boardsError } = await supabase
              .from("expense_boards")
              .select("*");

            if (boardsError) throw boardsError;

            console.log("Total number of boards:", boards.length);
            console.log("Boards:", boards);

            // Get shared users and their expenses for each board
            for (const board of boards) {
              const { data: sharedUsers, error: sharedError } = await supabase
                .from("shared_users")
                .select("*")
                .eq("board_id", board.id);

              if (sharedError) throw sharedError;

              console.log(`\nBoard: ${board.name}`);
              console.log("Shared with:", sharedUsers);

              // Get expenses for each shared user
              for (const sharedUser of sharedUsers) {
                console.log("Shared user:", sharedUser);
                const { data: userProfile, error: profileError } =
                  await supabase.from("profiles").select("*");

                if (profileError) throw profileError;

                console.log(`\nUser Profile: ${JSON.stringify(userProfile)}`);

                const { data: userExpenses, error: expensesError } =
                  await supabase
                    .from("expenses")
                    .select(
                      `
                    *,
                    category:category_id (
                      name
                    )
                  `
                    )
                    .eq("board_id", board.id);
                //.eq("created_by", sharedUser.user_id);

                if (expensesError) throw expensesError;

                console.log(`\nExpenses for user ${sharedUser.user_id}:`);
                console.log("Total expenses:", userExpenses.length);
                console.log(
                  "Expense details:",
                  userExpenses.map((expense) => ({
                    amount: expense.amount,
                    category: expense.category?.name,
                    date: expense.date,
                    description: expense.description,
                  }))
                );
              }
            }
          } catch (error) {
            console.error("Error fetching board information:", error);
          }
        }}
      >
        <MaterialCommunityIcons
          name="information"
          size={24}
          color={theme.warning}
        />
        <Text style={[styles.actionText, { color: theme.text }]}>
          Board Info
        </Text>
      </TouchableOpacity>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  exploreText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: Platform.OS === "android" ? 12 : 20,
    paddingTop: Platform.OS === "android" ? 24 : 10,
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
    fontSize: Platform.OS === "android" ? 14 : 16,
    opacity: 0.7,
  },
  nameText: {
    fontSize: Platform.OS === "android" ? 20 : 24,
    fontWeight: "bold",
  },
  notificationButton: {
    padding: Platform.OS === "android" ? 6 : 8,
    marginLeft: Platform.OS === "android" ? 6 : 8,
  },
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: Platform.OS === "android" ? 16 : 20,
    padding: Platform.OS === "android" ? 16 : 20,
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
    marginBottom: 5,
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
  combinedProgressContainer: {
    width: "100%",
    // marginTop: 8,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  combinedProgressBar: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    flexDirection: "row",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  remainingFill: {
    height: "100%",
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  progressLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500",
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
    marginBottom: 60,
  },
  transactionsList: {
    maxHeight: 320, // Height to fit 4 transactions
    marginTop: 12,
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
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  notificationCount: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
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
  logo: {
    width: width * 0.8,
    height: height * 0.8,
    resizeMode: "contain",
  },
});
