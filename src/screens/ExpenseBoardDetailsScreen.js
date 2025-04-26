import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Header } from "../components/Header";
import ShareModal from "../components/ShareModal";
import { expenseBoardService } from "../services/expenseBoardService";
import { expenseService } from "../services/expenseService";
import { showToast } from "../utils/toast";
import { useNavigation, useRoute } from "@react-navigation/native";
import { formatCurrency } from "../utils/formatters";
import ExpenseItem from "../components/ExpenseItem";

export const ExpenseBoardDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { boardId, boardName, totalExpenses, totalBudget, totalTransactions } =
    route.params;
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [expenses, setExpenses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const fetchData = async (pageNum = 1, isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const { data: transactionsData, count } =
        await expenseService.getExpensesbyBoardId(
          boardId,
          null,
          pageNum,
          ITEMS_PER_PAGE
        );

      if (isRefreshing || pageNum === 1) {
        setExpenses(transactionsData || []);
        setTotalCount(count || 0);
      } else {
        setExpenses((prev) => [...prev, ...(transactionsData || [])]);
      }

      setHasMore((transactionsData?.length || 0) === ITEMS_PER_PAGE);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast.error("Error loading data");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [boardId]);

  const onRefresh = React.useCallback(() => {
    fetchData(1, true);
  }, []);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchData(page + 1);
    }
  };

  const handleDeleteBoard = async () => {
    try {
      await expenseBoardService.deleteExpenseBoard(boardId);
      showToast.success("Expense board deleted successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting board:", error);
      showToast.error("Failed to delete expense board");
    }
  };

  const handleShareBoard = () => {
    setShowShareModal(true);
  };

  if (loading && page === 1) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <Header title="Loading..." onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const remainingBudget = totalBudget - totalExpenses;

  const renderEmptyState = () => (
    <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: `${theme.primary}15` },
        ]}
      >
        <MaterialCommunityIcons
          name="receipt"
          size={32}
          color={theme.primary}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No Transactions Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Start by adding your first expense to this board
      </Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate("AddExpense", { boardId })}
      >
        <MaterialCommunityIcons name="plus" size={24} color={theme.white} />
        <Text style={[styles.addButtonText, { color: theme.white }]}>
          Add Expense
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadMore = () => {
    if (!hasMore) return null;

    return (
      <TouchableOpacity
        style={[styles.loadMoreButton, { backgroundColor: theme.card }]}
        onPress={loadMore}
        disabled={loadingMore}
      >
        {loadingMore ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <>
            <MaterialCommunityIcons
              name="arrow-down"
              size={20}
              color={theme.primary}
            />
            <Text style={[styles.loadMoreText, { color: theme.text }]}>
              Load More
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title={boardName}
        onBack={() => navigation.goBack()}
        rightComponent={
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleShareBoard}
            >
              <MaterialCommunityIcons
                name="share-variant"
                size={24}
                color={theme.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleDeleteBoard}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={24}
                color={theme.error}
              />
            </TouchableOpacity>
          </View>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;
          if (isCloseToBottom && !loadingMore && hasMore) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.content}>
          <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
            <View style={styles.statsMain}>
              <View style={styles.statsRow}>
                <View style={styles.statsLabelContainer}>
                  <MaterialCommunityIcons
                    name="wallet-outline"
                    size={20}
                    color={theme.text}
                    style={styles.statsIcon}
                  />
                  <Text style={[styles.statsLabel, { color: theme.text }]}>
                    Budget
                  </Text>
                </View>
                <Text style={[styles.statsValue, { color: theme.text }]}>
                  {formatCurrency(totalBudget)}
                </Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statsLabelContainer}>
                  <MaterialCommunityIcons
                    name="cash-remove"
                    size={20}
                    color={theme.text}
                    style={styles.statsIcon}
                  />
                  <Text style={[styles.statsLabel, { color: theme.text }]}>
                    Spent
                  </Text>
                </View>
                <Text style={[styles.statsValue, { color: theme.text }]}>
                  {formatCurrency(totalExpenses)}
                </Text>
              </View>

              <View style={[styles.statsRow, styles.remainingRow]}>
                <View style={styles.statsLabelContainer}>
                  <MaterialCommunityIcons
                    name="cash-check"
                    size={20}
                    color={remainingBudget >= 0 ? theme.success : theme.error}
                    style={styles.statsIcon}
                  />
                  <Text
                    style={[
                      styles.statsLabel,
                      {
                        color:
                          remainingBudget >= 0 ? theme.success : theme.error,
                      },
                    ]}
                  >
                    Remaining
                  </Text>
                </View>
                <Text
                  style={[
                    styles.statsValue,
                    {
                      color: remainingBudget >= 0 ? theme.success : theme.error,
                    },
                  ]}
                >
                  {formatCurrency(remainingBudget)}
                </Text>
              </View>
            </View>

            <View style={styles.combinedProgressContainer}>
              <View style={styles.progressLabels}>
                <Text style={[styles.progressLabel, { color: theme.text }]}>
                  Budget Usage
                </Text>
                <View style={styles.progressLegend}>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        {
                          backgroundColor:
                            remainingBudget >= 0 ? theme.error : theme.error,
                        },
                      ]}
                    />
                    <Text style={[styles.legendText, { color: theme.text }]}>
                      Used
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        {
                          backgroundColor:
                            remainingBudget >= 0 ? theme.success : theme.error,
                        },
                      ]}
                    />
                    <Text style={[styles.legendText, { color: theme.text }]}>
                      Remaining
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        {
                          backgroundColor:
                            remainingBudget >= 0 ? theme.success : theme.error,
                        },
                      ]}
                    />
                    <Text style={[styles.progressLabel, { color: theme.text }]}>
                      {`${Math.round(
                        (totalExpenses / (totalBudget || 1)) * 100
                      )}%`}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.combinedProgressBar,
                  { backgroundColor: theme.border },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.round(
                        (totalExpenses / (totalBudget || 1)) * 100
                      )}%`,
                      backgroundColor:
                        remainingBudget >= 0 ? theme.error : theme.error,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.remainingFill,
                    {
                      width: `100%`,
                      backgroundColor:
                        remainingBudget >= 0 ? theme.success : theme.error,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {expenses.length > 0 ? (
            <View>
              <View style={styles.transactionsHeader}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                  {` Transactions (${totalTransactions})`}
                </Text>
              </View>
              <View>
                {expenses.map((expense) => (
                  <ExpenseItem
                    key={expense.id}
                    expense={expense}
                    onPress={() =>
                      navigation.navigate("ExpenseDetails", {
                        expenseId: expense.id,
                      })
                    }
                    onDelete={() => {
                      // Handle delete if needed
                      console.log("Delete expense:", expense.id);
                    }}
                  />
                ))}
              </View>
            </View>
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>
      <View style={styles.bottomButtons}>
        {renderLoadMore()}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate("AddExpense", { boardId })}
          >
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color={theme.primary}
            />
            <Text style={[styles.actionButtonText, { color: theme.text }]}>
              Add
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate("Analysis", { boardId })}
          >
            <MaterialCommunityIcons
              name="chart-bar"
              size={24}
              color={theme.primary}
            />
            <Text style={[styles.actionButtonText, { color: theme.text }]}>
              Analysis
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        boardName={boardName}
        boardId={boardId}
        boardColor={theme.primary}
        boardIcon="view-grid"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsMain: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  remainingRow: {
    marginTop: 2,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  statsLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsIcon: {
    marginRight: 8,
  },
  statsLabel: {
    fontSize: 16,
    opacity: 0.9,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  combinedProgressContainer: {
    width: "100%",
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
  deleteButton: {
    padding: 8,
  },
  bottomButtons: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 22,
    marginBottom: 10,
    fontWeight: "600",
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: "center",
    opacity: 0.8,
  },
  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: "#666",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,

    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  countText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
