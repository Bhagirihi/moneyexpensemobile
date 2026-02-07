import React, { useEffect, useState, useRef, useCallback } from "react";
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
  RefreshControl,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { getSession, supabase, getUserProfile } from "../config/supabase";
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
import {
  sendCreateCategoryNotification,
  sendCreateExpenseBoardNotification,
  sendCreateExpenseNotification,
  sendDeleteCategoryNotification,
  sendExpenseBoardDeletedNotification,
  sendExpenseBoardInviteNotification,
  sendExpenseBoardUpdatedNotification,
  sendExpenseDeletedNotification,
  sendExpenseOverBudgetNotification,
  sendPushNotification,
  sendUpdateCategoryNotification,
} from "../services/pushNotificationService";
import { fetchDashboardData } from "../fetcher";
import { useTranslation } from "../hooks/useTranslation";

const { width, height } = Dimensions.get("window");

export const DashboardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
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
  const pushToken = userProfile?.expo_push_token; // Replace with actual token
  const message = "Hello, you have a new notification!";

  const loadProfile = useCallback(async () => {
    try {
      const { session } = await getSession();
      if (!session?.user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (!error) setUserProfile(data);
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  }, []);

  const memoizedCalculateMonthlyStats = useCallback(
    (expensesData) => {
      const totalExpenses = expensesData.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      const budgetUsage = (totalExpenses / (stats.totalBudget || 1)) * 100;

      // Check budget usage thresholds and send notifications
      if (budgetUsage >= 100) {
        sendExpenseOverBudgetNotification({
          boardName: "Dashboard",
          icon: "alert",
          iconColor: "#F44336",
          budgetAmount: stats.totalBudget,
          expenseAmount: totalExpenses,
        });
      } else if (budgetUsage >= 90) {
        sendExpenseOverBudgetNotification({
          boardName: "Dashboard",
          icon: "alert",
          iconColor: "#F44336",
          budgetAmount: stats.totalBudget,
          expenseAmount: totalExpenses,
        });
      } else if (budgetUsage >= 70) {
        sendExpenseOverBudgetNotification({
          boardName: "Dashboard",
          icon: "alert",
          iconColor: "#FF9800",
          budgetAmount: stats.totalBudget,
          expenseAmount: totalExpenses,
        });
      } else if (budgetUsage >= 50) {
        sendExpenseOverBudgetNotification({
          boardName: "Dashboard",
          icon: "alert",
          iconColor: "#FFC107",
          budgetAmount: stats.totalBudget,
          expenseAmount: totalExpenses,
        });
      }

      setStats((prevStats) => ({
        ...prevStats,
        totalExpenses,
        remainingBudget: prevStats.totalBudget - totalExpenses,
      }));
    },
    [stats.totalBudget]
  );

  // Set up real-time subscriptions
  useEffect(() => {
    const stop = realTimeSync(async (payload) => {
      console.log("📥", payload);
      await loadProfile();
      await fetchDashboardDataState(); // or React Query invalidateQueries
      await fetchUnreadCount();
    });

    return stop; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    fetchDashboardDataState(), fetchUnreadCount();
  }, []);

  const fetchDashboardDataState = async () => {
    try {
      const data = await fetchDashboardData();
      setExpenses(data.recentTransactions);
      setHasBoards(data.hasBoard);
      setStats(data.stats);
      memoizedCalculateMonthlyStats(data.recentTransactions);
      console.log(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // useEffect(() => {
  //   const subscription = realTimeSync.subscribeToNotifications(() => {
  //     fetchUnreadCount();
  //   });

  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // }, []);

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
    await Promise.all([loadProfile(), fetchDashboardDataState()]);
    setRefreshing(false);
  }, [loadProfile]);

  const handleDeletePress = async (expenseId) => {
    try {
      await expenseService.deleteExpense(expenseId);
      const updatedExpenses = expenses.filter(
        (expense) => expense.id !== expenseId
      );
      setExpenses(updatedExpenses);
      memoizedCalculateMonthlyStats(updatedExpenses);
      showToast.success(
        t("expenseDeletedSuccess"),
        t("expenseDeletedMessage")
      );
    } catch (error) {
      console.error("Error deleting expense:", error);
      showToast.error(t("failedToDeleteExpense"), t("tryAgainLater"));
    }
  };
  let remainingBudget;
  // const fetchDashboardData = async () => {
  //   try {
  //     //setLoading(true);

  //     // Fetch expense boards
  //     const expenseBoards = await expenseBoardService.getExpenseBoards();
  //     setHasBoards(expenseBoards.length > 0);

  //     // Calculate total budget and expenses from boards
  //     const totalBudget = expenseBoards.reduce(
  //       (sum, board) => sum + (board.total_budget || 0),
  //       0
  //     );
  //     const totalExpenses = expenseBoards.reduce(
  //       (sum, board) => sum + (board.totalExpenses || 0),
  //       0
  //     );
  //     remainingBudget = totalBudget - totalExpenses;

  //     // Update stats
  //     setStats({
  //       totalBudget,
  //       totalExpenses,
  //       remainingBudget,
  //     });

  //     // Fetch recent transactions
  //     const { data: transactionsData, error: transactionsError } =
  //       await dashboardService.getRecentTransactions();

  //     console.log("transactionsData", transactionsData);

  //     if (transactionsError) {
  //       console.log("Error fetching transactions:", transactionsError);
  //     }

  //     setExpenses(transactionsData);
  //   } catch (error) {
  //     console.error("Error fetching dashboard data:", error.message);
  //     showToast.error("Failed to load dashboard data");
  //     setExpenses([]);
  //   } finally {
  //     // setLoading(false);
  //   }
  // };

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
              {t("totalBudget")}
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
              {t("spent")}
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
            {t("budgetUsage")}
          </Text>

          <View style={styles.progressLegend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: theme.error }]}
              />
              <Text style={[styles.legendText, { color: theme.white }]}>
                {t("used")}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: theme.success }]}
              />
              <Text style={[styles.legendText, { color: theme.white }]}>
                {t("remaining")}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  {
                    backgroundColor:
                      stats.totalBudget >= 0 ? theme.success : theme.error,
                  },
                ]}
              />
              <Text style={[styles.progressLabel, { color: theme.white }]}>
                {`${Math.round(
                  (stats.totalExpenses / (stats.totalBudget || 1)) * 100
                )}%`}
              </Text>
            </View>
          </View>
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
        <Text style={[styles.actionText, { color: theme.text }]}>{t("boards")}</Text>
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
          {t("addExpense")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate("Categories")}
      >
        <MaterialCommunityIcons name="tag" size={24} color={theme.warning} />
        <Text style={[styles.actionText, { color: theme.text }]}>
          {t("categories")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderNotificationTestButtons = () => (
    <View style={styles.notificationTestContainer}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        {t("testNotifications")}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.notificationButtonsScroll}
      >
        <TouchableOpacity
          style={[styles.notificationButton, { backgroundColor: theme.card }]}
          onPress={() =>
            sendPushNotification(
              "Test Notification",
              "This is a test notification"
            )
          }
        >
          <MaterialCommunityIcons name="bell" size={20} color={theme.primary} />
          <Text style={[styles.notificationButtonText, { color: theme.text }]}>
            {t("basic")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.notificationButton, { backgroundColor: theme.card }]}
          onPress={() =>
            sendCreateExpenseBoardNotification({
              boardName: "Test Board",
              icon: "view-grid",
              iconColor: "#4CAF50",
            })
          }
        >
          <MaterialCommunityIcons
            name="view-grid"
            size={20}
            color={theme.success}
          />
          <Text style={[styles.notificationButtonText, { color: theme.text }]}>
            {t("boardCreated")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.notificationButton, { backgroundColor: theme.card }]}
          onPress={() =>
            sendExpenseBoardInviteNotification({
              boardName: "Test Board",
              inviteeName: "John Doe",
              icon: "account-plus",
              iconColor: "#2196F3",
            })
          }
        >
          <MaterialCommunityIcons
            name="account-plus"
            size={20}
            color={theme.primary}
          />
          <Text style={[styles.notificationButtonText, { color: theme.text }]}>
            {t("boardInvite")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.notificationButton, { backgroundColor: theme.card }]}
          onPress={() =>
            sendCreateExpenseNotification({
              boardName: "Test Board",
              icon: "cash",
              iconColor: "#FF9800",
              expenseName: "Test Expense",
              expenseAmount: 100,
            })
          }
        >
          <MaterialCommunityIcons name="cash" size={20} color={theme.warning} />
          <Text style={[styles.notificationButtonText, { color: theme.text }]}>
            {t("expenseCreated")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.notificationButton, { backgroundColor: theme.card }]}
          onPress={() =>
            sendCreateCategoryNotification({
              boardName: "Test Board",
              icon: "tag",
              iconColor: "#9C27B0",
              categoryName: "Test Category",
            })
          }
        >
          <MaterialCommunityIcons name="tag" size={20} color={theme.primary} />
          <Text style={[styles.notificationButtonText, { color: theme.text }]}>
            {t("categoryCreated")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.notificationButton, { backgroundColor: theme.card }]}
          onPress={() =>
            sendDeleteCategoryNotification({
              boardName: "Test Board",
              icon: "delete",
              iconColor: "#F44336",
              categoryName: "Test Category",
            })
          }
        >
          <MaterialCommunityIcons name="delete" size={20} color={theme.error} />
          <Text style={[styles.notificationButtonText, { color: theme.text }]}>
            {t("deleteCategory")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.notificationButton, { backgroundColor: theme.card }]}
          onPress={() =>
            sendUpdateCategoryNotification({
              boardName: "Test Board",
              icon: "pencil",
              iconColor: "#2196F3",
              categoryName: "Test Category",
            })
          }
        >
          <MaterialCommunityIcons
            name="pencil"
            size={20}
            color={theme.primary}
          />
          <Text style={[styles.notificationButtonText, { color: theme.text }]}>
            {t("updateCategory")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.notificationButton, { backgroundColor: theme.card }]}
          onPress={() =>
            sendExpenseOverBudgetNotification({
              boardName: "Test Board",
              icon: "alert",
              iconColor: "#F44336",
              budgetAmount: 1000,
              expenseAmount: 1200,
            })
          }
        >
          <MaterialCommunityIcons name="alert" size={20} color={theme.error} />
          <Text style={[styles.notificationButtonText, { color: theme.text }]}>
            {t("overBudget")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.notificationButton, { backgroundColor: theme.card }]}
          onPress={() =>
            sendExpenseDeletedNotification({
              boardName: "Test Board",
              icon: "delete",
              iconColor: "#F44336",
              expenseName: "Test Expense",
              expenseAmount: 100,
            })
          }
        >
          <MaterialCommunityIcons name="delete" size={20} color={theme.error} />
          <Text style={[styles.notificationButtonText, { color: theme.text }]}>
            {t("expenseDeleted")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderTransactionsSection = () => (
    <View style={styles.transactionsSection}>
      <ExpenseList
        expenses={expenses.slice(0, 3)}
        title={t("recentTransactions")}
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
              source={require("../../assets/icon.png")}
              resizeMode="cover"
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
              {t("welcomeBack")}
            </Text>
            <Text style={[styles.nameText, { color: theme.text }]}>
              {capitalizeFirstLetter(userProfile?.full_name) || t("guest")}
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
      {renderNotificationTestButtons()}

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
  notificationTestContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  notificationButtonsScroll: {
    marginTop: 10,
  },
  notificationButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  notificationButtonText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: "500",
  },
});
