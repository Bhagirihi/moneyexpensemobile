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
  Modal,
  Share,
  Clipboard,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components/Header";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { expenseBoardService } from "../services/expenseBoardService";
import { showToast } from "../utils/toast";

const { width } = Dimensions.get("window");

export const ExpenseBoardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [expenseBoards, setExpenseBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);

  useEffect(() => {
    fetchExpenseBoards();
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

      console.log("Fetched boards =>", data);
      setExpenseBoards(data);
    } catch (error) {
      console.error("Error in fetchBoards:", error);
      showToast.error("Failed to fetch boards", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShareBoard = async (board) => {
    setSelectedBoard(board);
    setShowShareModal(true);
  };

  const handleCopyCode = () => {
    if (selectedBoard) {
      Clipboard.setString(selectedBoard.id);
      showToast.success("Success", "Board code copied to clipboard");
    }
  };

  const handleShareViaEmail = async () => {
    if (selectedBoard) {
      try {
        const message = `Join my expense board "${selectedBoard.name}" on TripExpanse!\n\nBoard Code: ${selectedBoard.id}\n\nClick here to join: https://tripexpanse.app/join/${selectedBoard.id}`;
        await Share.share({
          message,
          subject: `Join my expense board: ${selectedBoard.name}`,
        });
      } catch (error) {
        console.error("Error sharing via email:", error);
      }
    }
  };

  const handleShareViaSocial = async () => {
    if (selectedBoard) {
      try {
        const message = `Join my expense board "${selectedBoard.name}" on TripExpanse!\n\nBoard Code: ${selectedBoard.id}\n\nClick here to join: https://tripexpanse.app/join/${selectedBoard.id}`;
        await Share.share({
          message,
        });
      } catch (error) {
        console.error("Error sharing via social:", error);
      }
    }
  };

  const renderShareModal = () => (
    <Modal
      visible={showShareModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowShareModal(false)}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Share Expense Board
            </Text>
            <TouchableOpacity onPress={() => setShowShareModal(false)}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {selectedBoard && (
            <View style={styles.shareContent}>
              <View style={styles.boardInfo}>
                <View
                  style={[
                    styles.boardIcon,
                    {
                      backgroundColor: `${
                        selectedBoard.color || theme.primary
                      }15`,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={selectedBoard.icon || "view-grid"}
                    size={24}
                    color={selectedBoard.color || theme.primary}
                  />
                </View>
                <Text style={[styles.boardName, { color: theme.text }]}>
                  {selectedBoard.name}
                </Text>
              </View>

              <View style={styles.codeContainer}>
                <Text
                  style={[styles.codeLabel, { color: theme.textSecondary }]}
                >
                  Board Code
                </Text>
                <View style={[styles.codeBox, { backgroundColor: theme.card }]}>
                  <Text style={[styles.codeText, { color: theme.text }]}>
                    {selectedBoard.id}
                  </Text>
                  <TouchableOpacity onPress={handleCopyCode}>
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
                  onPress={handleShareViaEmail}
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
                  onPress={handleShareViaSocial}
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
          )}
        </View>
      </View>
    </Modal>
  );

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
      {renderShareModal()}
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
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  shareContent: {
    padding: 8,
  },
  boardInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
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
  shareButton: {
    padding: 8,
    marginLeft: 8,
  },
});
