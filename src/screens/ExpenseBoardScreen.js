import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components/Header";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { expenseBoardService } from "../services/expenseBoardService";
import ShareModal from "../components/ShareModal";
import { showToast } from "../utils/toast";
import { realTimeSync } from "../services/realTimeSync";

const { width } = Dimensions.get("window");

export const ExpenseBoardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [expenseBoards, setExpenseBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);

  useEffect(() => {
    fetchExpenseBoards();
    const cleanup = realTimeSync.subscribeToExpenseBoard(fetchExpenseBoards);
    return () => {
      if (cleanup && typeof cleanup === "function") {
        cleanup();
      }
    };
  }, []);

  const fetchExpenseBoards = async () => {
    try {
      setLoading(true);
      console.log("Fetching expense boards in screen... ==>");
      const data = await expenseBoardService.getExpenseBoards();

      if (!data) {
        console.error("No data received from service");
        showToast.error("Failed to fetch boards", "No data received");
        return;
      }

      setExpenseBoards(data);
    } catch (error) {
      console.error("Error in fetchBoards:", error);
      showToast.error("Failed to fetch boards", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShareBoard = (board) => {
    setSelectedBoard(board);
    setShowShareModal(true);
  };

  const handleDeleteBoard = async (board) => {
    try {
      await expenseBoardService.deleteExpenseBoard(board.id);
    } catch (error) {
      console.error("Error in deleteBoard:", error);
      showToast.error("Failed to delete board", error.message);
    }
  };

  const renderExpenseBoard = (board) => (
    <TouchableOpacity
      key={board.id}
      style={[styles.boardCard, { backgroundColor: theme.card }]}
      onPress={() =>
        navigation.navigate("ExpenseBoardDetails", {
          boardId: board.id,
          boardName: board.name,
          totalExpenses: board.totalExpenses,
          totalBudget: board.total_budget,
          totalTransactions: board.totalTransactions,
        })
      }
    >
      <View style={styles.boardHeader}>
        <View
          style={[
            styles.boardIcon,
            { backgroundColor: `${board.color || theme.primary}15` },
          ]}
        >
          <MaterialCommunityIcons
            name={board.icon || "view-grid"}
            size={24}
            color={board.color || theme.primary}
          />
        </View>
        <Text style={[styles.boardName, { color: theme.text }]}>
          {board.name}
        </Text>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            handleShareBoard(board);
          }}
          style={styles.shareButton}
        >
          <MaterialCommunityIcons
            name="share-variant"
            size={20}
            color={theme.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteBoard(board);
          }}
          style={styles.deleteButton}
        >
          <MaterialCommunityIcons name="delete" size={20} color={theme.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.boardStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Total Expenses
          </Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            ₹{board?.totalExpenses?.toFixed(2)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Budget
          </Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            ₹{board?.total_budget?.toFixed(2)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Transactions
          </Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {board?.totalTransactions || 0}
          </Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor:
                  board?.totalExpenses > board?.total_budget
                    ? theme.error
                    : theme.success,
                width: `${Math.min(
                  (board?.totalExpenses / board?.total_budget) * 100,
                  100
                )}%`,
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <Header
          title="Expense Board"
          onBack={() => navigation.goBack()}
          rightComponent={
            <TouchableOpacity
              onPress={() => navigation.navigate("CreateExpenseBoard")}
              style={styles.addButton}
            >
              <MaterialCommunityIcons
                name="plus"
                size={24}
                color={theme.primary}
              />
            </TouchableOpacity>
          }
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title="Expense Board"
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            onPress={() => navigation.navigate("CreateExpenseBoard")}
            style={styles.addButton}
          >
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color={theme.primary}
            />
          </TouchableOpacity>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {expenseBoards.length > 0 ? (
          expenseBoards.map(renderExpenseBoard)
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="view-grid-outline"
              size={48}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No expense boards found
            </Text>
          </View>
        )}
      </ScrollView>
      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        boardName={selectedBoard?.name || ""}
        boardId={selectedBoard?.id || ""}
        boardColor={selectedBoard?.color || theme.primary}
        boardIcon={selectedBoard?.icon || "view-grid"}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  addButton: {
    padding: 8,
  },
  boardCard: {
    padding: 16,
    borderRadius: 16,
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
  boardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  boardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  boardName: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  boardStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
  deleteButton: {
    marginHorizontal: 12,
  },
  shareButton: {
    marginHorizontal: 12,
  },
});
