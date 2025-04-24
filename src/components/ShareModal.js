import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Share,
  Clipboard,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { showToast } from "../utils/toast";

const ShareModal = ({
  visible,
  onClose,
  boardName,
  boardId,
  boardColor,
  boardIcon,
}) => {
  const { theme } = useTheme();

  // const handleCopyCode = () => {
  //   Clipboard.setString(boardId);
  //   showToast.success("Success", "Board code copied to clipboard");
  // };

  // const handleShareViaEmail = async () => {
  //   try {
  //     const message = `Join my expense board "${boardName}" on Trivense!\n\nBoard Code: ${boardId}\n\nClick here to join: https://trivense.app/join/${boardId}`;
  //     await Share.share({
  //       message,
  //       subject: `Join my expense board: ${boardName}`,
  //     });
  //   } catch (error) {
  //     console.error("Error sharing via email:", error);
  //   }
  // };

  // const handleShareViaSocial = async () => {
  //   try {
  //     const message = `Join my expense board "${boardName}" on Trivense!\n\nBoard Code: ${boardId}\n\nClick here to join: https://trivense.app/join/${boardId}`;
  //     await Share.share({
  //       message,
  //     });
  //   } catch (error) {
  //     console.error("Error sharing via social:", error);
  //   }
  // };

  const handleShareApp = async (method) => {
    try {
      const message = `Join my expense board "${boardName}" on Trivense!\n\nBoard Code: ${boardId}\n\nClick here to join: https://trivense.app/join/${boardId}`;

      let result;

      if (method === "email" || method === "social") {
        result = await Share.share({
          message,
          ...(method === "email" && {
            subject: "Join my expense board: ${boardName}",
          }),
        });

        if (result.action === Share.sharedAction) {
          showToast.success("Thanks for Sharing!", "Your invite was shared 🎉");
          console.log("User shared the invite");
        } else if (result.action === Share.dismissedAction) {
          // Optional: silently ignore or log
          console.log("User dismissed the share dialog.");
        }
      } else if (method === "copy") {
        await Clipboard.setString(boardId);
        showToast.success("Copied!", "Board code copied to clipboard 📋");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      showToast.error("Error", "Failed to share. Please try again.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Share Expense Board
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.shareContent}>
            <View style={styles.boardInfo}>
              <View
                style={[
                  styles.boardIcon,
                  {
                    backgroundColor: `${boardColor || theme.primary}15`,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={boardIcon || "view-grid"}
                  size={24}
                  color={boardColor || theme.primary}
                />
              </View>
              <Text style={[styles.boardName, { color: theme.text }]}>
                {boardName}
              </Text>
            </View>

            <View style={styles.codeContainer}>
              <Text style={[styles.codeLabel, { color: theme.textSecondary }]}>
                Board Code
              </Text>
              <View style={[styles.codeBox, { backgroundColor: theme.card }]}>
                <Text style={[styles.codeText, { color: theme.text }]}>
                  {boardId}
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
};

const styles = StyleSheet.create({
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
});

export default ShareModal;
