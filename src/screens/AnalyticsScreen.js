import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  Modal,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components/Header";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../config/supabase";
import { formatCurrency } from "../utils/formatters";
import {
  fetchAnalytics,
  fetchExpenseTrends,
} from "../services/analyticsService";
const { width } = Dimensions.get("window");

const TIME_PERIODS = [
  { id: "week", label: "This Week", icon: "calendar-week", days: 7 },
  { id: "month", label: "This Month", icon: "calendar-month", days: 30 },
  { id: "year", label: "This Year", icon: "calendar-range", days: 365 },
  { id: "all", label: "All Time", icon: "calendar-clock", days: null },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  periodDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  periodDropdownText: {
    fontSize: 16,
    fontWeight: "600",
  },
  periodDropdownIcon: {
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  periodOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  periodOptionIcon: {
    marginRight: 12,
  },
  periodOptionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  summaryCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  summarySubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
  summaryTrend: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  trendText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    flexWrap: "wrap",
    gap: 8,
  },
  statItem: {
    flex: 1,
    minWidth: "30%",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
    flexShrink: 1,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  insightsContainer: {
    marginTop: 8,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  categoryBreakdown: {
    marginTop: 16,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  categoryAmount: {
    fontSize: 12,
    opacity: 0.7,
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    opacity: 0.7,
  },
});

export const AnalyticsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalExpenses: 0,
    averageExpense: 0,
    topCategories: [],
    insights: [],
    stats: {
      highestSpending: 0,
      lowestSpending: 0,
      totalTransactions: 0,
    },
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const trends = await fetchExpenseTrends(user.id, selectedPeriod);
      const statistics = trends.statistics;
      const trendData = trends.trendData;
      const dummyData = {
        totalExpenses: statistics.totalAmount,
        averageExpense: statistics?.averageAmountPerDay,
        stats: {
          highestSpending: statistics.highestAmount,
          lowestSpending: statistics.lowestAmount,
          totalTransactions: statistics.totalCount,
          highestCategory: statistics?.categoryBreakdown[0]?.name,
          highestCategoryPercentage:
            statistics?.categoryBreakdown[0]?.percentage,
          previousPeriod: {
            percentageChange: statistics.previousPeriod?.percentageChange || 0,
          },
        },
        topCategories: statistics?.categoryBreakdown || [],
        insights: [
          {
            title: `Spending ${
              statistics.previousPeriod?.percentageChange >= 0
                ? "Increased"
                : "Decreased"
            }`,
            description: `Your spending ${
              statistics.previousPeriod?.percentageChange >= 0
                ? "increased"
                : "decreased"
            } by ${Math.abs(
              statistics.previousPeriod?.percentageChange || 0
            )}% compared to last ${selectedPeriod}`,
            icon:
              statistics.previousPeriod?.percentageChange >= 0
                ? "trending-up"
                : "trending-down",
            color:
              statistics.previousPeriod?.percentageChange >= 0
                ? "#FF6B6B"
                : "#4ECDC4",
          },
          {
            title: "Top Category",
            description: `${statistics?.categoryBreakdown[0]?.name},${statistics?.categoryBreakdown[1]?.name},and ${statistics?.categoryBreakdown[2]?.name} are the top 3 categories of your spending.`,
            icon: "food",
            color: "#4ECDC4",
          },
          {
            title: "Savings Opportunity",
            description: `You could save ${Math.abs(
              statistics.previousPeriod?.percentageChange || 0
            )}% by reducing ${statistics?.categoryBreakdown[0]?.name} expenses`,
            icon: "piggy-bank",
            color: "#45B7D1",
          },
        ],
      };

      await setAnalytics(dummyData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    const checkAnalytics = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const analytics = await fetchAnalytics(user.id, selectedPeriod);
        const trends = await fetchExpenseTrends(user.id, selectedPeriod);
        console.log("Analytics Data:", analytics);
        console.log("Expense Trends:", trends);
      } catch (error) {
        console.error("Error checking analytics:", error);
      }
    };

    checkAnalytics();
  }, [selectedPeriod]);

  const renderPeriodDropdown = () => (
    <TouchableOpacity
      style={[styles.periodDropdown, { backgroundColor: theme.card }]}
      onPress={() => setShowPeriodDropdown(true)}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <MaterialCommunityIcons
          name={TIME_PERIODS.find((p) => p.id === selectedPeriod)?.icon}
          size={24}
          color={theme.primary}
        />
        <Text style={[styles.periodDropdownText, { color: theme.text }]}>
          {TIME_PERIODS.find((p) => p.id === selectedPeriod)?.label}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-down"
        size={24}
        color={theme.text}
        style={styles.periodDropdownIcon}
      />
    </TouchableOpacity>
  );

  const renderPeriodModal = () => (
    <Modal
      visible={showPeriodDropdown}
      transparent
      animationType="slide"
      onRequestClose={() => setShowPeriodDropdown(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Select Period
            </Text>
            <TouchableOpacity onPress={() => setShowPeriodDropdown(false)}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>
          {TIME_PERIODS.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.periodOption,
                {
                  backgroundColor:
                    selectedPeriod === period.id
                      ? `${theme.primary}15`
                      : "transparent",
                },
              ]}
              onPress={() => {
                setSelectedPeriod(period.id);
                setShowPeriodDropdown(false);
              }}
            >
              <MaterialCommunityIcons
                name={period.icon}
                size={24}
                color={
                  selectedPeriod === period.id ? theme.primary : theme.text
                }
                style={styles.periodOptionIcon}
              />
              <Text
                style={[
                  styles.periodOptionText,
                  {
                    color:
                      selectedPeriod === period.id ? theme.primary : theme.text,
                  },
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  const renderSummaryCard = () => (
    <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
      <View style={styles.summaryHeader}>
        <Text style={[styles.summaryTitle, { color: theme.text }]}>
          Total Expenses
        </Text>
      </View>
      <Text style={[styles.summaryAmount, { color: theme.text }]}>
        {formatCurrency(analytics.totalExpenses)}
      </Text>
      <Text style={[styles.summarySubtext, { color: theme.textSecondary }]}>
        Average: {formatCurrency(analytics.averageExpense)} per day
      </Text>
      <View style={styles.summaryTrend}>
        <MaterialCommunityIcons
          name={
            analytics.stats.previousPeriod?.percentageChange >= 0
              ? "trending-up"
              : "trending-down"
          }
          size={20}
          color={
            analytics.stats.previousPeriod?.percentageChange >= 0
              ? theme.success
              : theme.error
          }
        />
        <Text
          style={[
            styles.trendText,
            {
              color:
                analytics.stats.previousPeriod?.percentageChange >= 0
                  ? theme.success
                  : theme.error,
            },
          ]}
        >
          {Math.abs(analytics.stats.previousPeriod?.percentageChange || 0)}%{" "}
          {analytics.stats.previousPeriod?.percentageChange >= 0
            ? "more"
            : "less"}{" "}
          than last {selectedPeriod}
        </Text>
      </View>
      <View style={styles.statsContainer}>
        <View
          style={[styles.statItem, { backgroundColor: `${theme.primary}15` }]}
        >
          <Text
            style={[styles.statValue, { color: theme.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(analytics.stats.highestSpending)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Highest
          </Text>
        </View>
        <View
          style={[styles.statItem, { backgroundColor: `${theme.primary}15` }]}
        >
          <Text
            style={[styles.statValue, { color: theme.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(analytics.stats.lowestSpending)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Lowest
          </Text>
        </View>
        <View
          style={[styles.statItem, { backgroundColor: `${theme.primary}15` }]}
        >
          <Text
            style={[styles.statValue, { color: theme.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {analytics.stats.totalTransactions}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Transactions
          </Text>
        </View>
        <View
          style={[styles.statItem, { backgroundColor: `${theme.primary}15` }]}
        >
          <Text
            style={[styles.statValue, { color: theme.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {analytics.stats.highestCategory}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Highest Category
          </Text>
        </View>
      </View>
    </View>
  );

  const renderInsights = () => (
    <View style={styles.insightsContainer}>
      <Text style={[styles.summaryTitle, { color: theme.text }]}>Insights</Text>
      {analytics.insights.map((insight, index) => (
        <View
          key={index}
          style={[styles.insightItem, { backgroundColor: theme.card }]}
        >
          <View
            style={[
              styles.insightIcon,
              { backgroundColor: `${insight.color}15` },
            ]}
          >
            <MaterialCommunityIcons
              name={insight.icon}
              size={24}
              color={insight.color}
            />
          </View>
          <View style={styles.insightContent}>
            <Text style={[styles.insightTitle, { color: theme.text }]}>
              {insight.title}
            </Text>
            <Text
              style={[
                styles.insightDescription,
                { color: theme.textSecondary },
              ]}
            >
              {insight.description}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCategoryBreakdown = () => (
    console.log("analytics.topCategories", analytics.topCategories),
    (
      <View style={styles.categoryBreakdown}>
        <Text
          style={[
            styles.summaryTitle,
            { color: theme.text, marginVertical: 10 },
          ]}
        >
          Category Breakdown
        </Text>

        {analytics.topCategories.map((category, index) => (
          <View
            key={index}
            style={[styles.categoryItem, { backgroundColor: theme.card }]}
          >
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: `${category.color}15` },
              ]}
            >
              <MaterialCommunityIcons
                name={category.icon}
                size={24}
                color={category.color}
              />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryName, { color: theme.text }]}>
                {category.name}
              </Text>
              <Text
                style={[styles.categoryAmount, { color: theme.textSecondary }]}
              >
                {formatCurrency(category.amount)}
              </Text>
            </View>
            <Text style={[styles.categoryPercentage, { color: theme.primary }]}>
              {`${category.percentage}% (${category.count})`}
            </Text>
          </View>
        ))}
      </View>
    )
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header title="Analytics" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content}>
        {renderPeriodDropdown()}
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : analytics.totalExpenses === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="chart-bar"
              size={48}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyStateText, { color: theme.text }]}>
              No expense data available for this period
            </Text>
          </View>
        ) : (
          <>
            {renderSummaryCard()}
            {renderInsights()}
            {renderCategoryBreakdown()}
          </>
        )}
      </ScrollView>
      {renderPeriodModal()}
    </SafeAreaView>
  );
};
