import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Share,
  Linking,
  Clipboard,
  Modal,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components/Header";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { expenseBoardService } from "../services/expenseBoardService";
import FormInput from "../components/common/FormInput";
import FormButton from "../components/common/FormButton";
import ShareModal from "../components/ShareModal";
import { showToast } from "../utils/toast";
import { formatNumber } from "../utils/formatters";
import { sendCreateExpenseBoardNotification } from "../services/pushNotificationService";

const BOARD_COLORS = [
  { id: "red", value: "#FF6B6B" },
  { id: "teal", value: "#4ECDC4" },
  { id: "blue", value: "#45B7D1" },
  { id: "green", value: "#96CEB4" },
  { id: "yellow", value: "#FFEEAD" },
  { id: "pink", value: "#D4A5A5" },
  { id: "purple", value: "#9B59B6" },
  { id: "navy", value: "#3498DB" },
  { id: "orange", value: "#E67E22" },
  { id: "mint", value: "#1ABC9C" },
];

const BOARD_ICONS = [
  { id: "home", name: "home", label: "Home" },
  { id: "work", name: "briefcase", label: "Work" },
  { id: "transport", name: "car", label: "Transport" },
  { id: "food", name: "food", label: "Food" },
  { id: "shopping", name: "shopping", label: "Shopping" },
  { id: "entertainment", name: "movie", label: "Entertainment" },
  { id: "music", name: "music", label: "Music" },
  { id: "education", name: "book", label: "Education" },
  { id: "gaming", name: "gamepad-variant", label: "Gaming" },
  { id: "travel", name: "airplane", label: "Travel" },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
  },
  inputContainer: {
    padding: 8,
    marginBottom: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    opacity: 0.8,
  },
  input: {
    padding: 10,
    borderRadius: 8,
    fontSize: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  descriptionInput: {
    height: 60,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  colorList: {
    paddingRight: 12,
    flex: 1,
    flexWrap: "wrap",
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconList: {
    paddingRight: 12,
    flex: 1,
    flexWrap: "wrap",
  },
  iconItem: {
    width: "auto",
    height: 70,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",

    marginRight: 6,
    marginBottom: 6,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
    fontWeight: "500",
  },
  createButton: {
    margin: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  budgetContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  budgetInput: {
    flex: 1,
    marginRight: 8,
  },
  shareContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  shareButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  shareIcon: {
    marginRight: 4,
  },
  sectionDivider: {
    height: 1,
    marginVertical: 8,
    opacity: 0.1,
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
});

export const CreateExpenseBoardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [selectedColor, setSelectedColor] = useState(BOARD_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(BOARD_ICONS[0]);
  const [description, setDescription] = useState("");
  const [perPersonBudget, setPerPersonBudget] = useState("");
  const [shareCode, setShareCode] = useState("");
  const [inviteLink, setinviteLink] = useState("");
  const [errors, setErrors] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!boardName.trim()) {
      newErrors.boardName = "Board name is required";
    }
    if (boardName.length > 50) {
      newErrors.boardName = "Board name must be less than 50 characters";
    }
    if (description.length > 200) {
      newErrors.description = "Description must be less than 200 characters";
    }
    if (
      !perPersonBudget ||
      isNaN(parseFloat(perPersonBudget)) ||
      parseFloat(perPersonBudget) <= 0
    ) {
      newErrors.perPersonBudget = "Please enter a valid budget amount";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [boardName, description, perPersonBudget]);

  const generateShareCode = useCallback(() => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setShareCode(code);
    return code;
  }, []);

  const handleShareBoard = () => {
    setShowShareModal(true);
  };

  const handleCopyCode = () => {
    const code = shareCode || generateShareCode();
    Clipboard.setString(code);
    showToast.success("Success", "Board code copied to clipboard");
  };

  const handleShareViaEmail = async () => {
    try {
      const code = shareCode || generateShareCode();
      const subject = `Join my expense board: ${boardName}`;
      const message = `Join my expense board "${boardName}" on Trivense!\n\nBoard Code: ${code}\n\nClick here to join: https://trivense.app/join/${code}`;
      await Share.share({
        message,
        subject,
      });
    } catch (error) {
      console.error("Error sharing via email:", error);
    }
  };

  const handleShareViaSocial = async () => {
    try {
      const code = shareCode || generateShareCode();
      const message = `Join my expense board "${boardName}" on Trivense!\n\nBoard Code: ${code}\n\nClick here to join: https://trivense.app/join/${code}`;
      await Share.share({
        message,
      });
    } catch (error) {
      console.error("Error sharing via social:", error);
    }
  };

  const handleCreateBoard = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const boardData = {
        name: boardName.trim(),
        description: description.trim(),
        color: selectedColor.value,
        icon: selectedIcon.name,
        total_budget: parseFloat(perPersonBudget),
        share_code: shareCode || generateShareCode(),
      };

      // Create the board first
      const { data: createdBoard, error } =
        await expenseBoardService.createExpenseBoard(boardData);

      if (error) throw error;

      // Send notification after successful board creation
      await sendCreateExpenseBoardNotification({
        boardName: boardName.trim(),
        icon: selectedIcon.name,
        iconColor: selectedColor.value,
      });

      showToast.success("Expense board created successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error creating board:", error);
      showToast.error("Failed to create board");
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = () => ({
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.text,
  });

  const getInputErrorStyle = () => ({
    borderColor: theme.error,
  });

  const getColorItemStyle = (color, isSelected) => ({
    backgroundColor: color.value,
    borderWidth: isSelected ? 2 : 1,
    borderColor: isSelected ? theme.primary : theme.border,
  });

  const getIconItemStyle = (isSelected) => ({
    backgroundColor: isSelected ? theme.primary : theme.card,
    borderWidth: isSelected ? 2 : 1,
    borderColor: isSelected ? theme.primary : theme.border,
  });

  const getIconColor = (isSelected) => (isSelected ? theme.white : theme.text);

  const getIconLabelColor = (isSelected) =>
    isSelected ? theme.white : theme.text;

  const getCreateButtonStyle = () => ({
    backgroundColor: theme.primary,
  });

  const getCreateButtonTextStyle = () => ({
    color: theme.white,
  });

  const getShareCodeContainerStyle = () => ({
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.card,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: theme.border,
  });

  const getShareCodeTextStyle = () => ({
    flex: 1,
    fontSize: 15,
    color: theme.text,
  });

  const getCopyButtonStyle = () => ({
    padding: 8,
    borderRadius: 6,
    backgroundColor: theme.primary,
  });

  const renderBoardNameInput = () => (
    <FormInput
      label="Board Name"
      value={boardName}
      onChangeText={(text) => {
        setBoardName(text);
        if (errors.boardName) {
          setErrors((prev) => ({ ...prev, boardName: undefined }));
        }
      }}
      placeholder="Enter board name"
      error={errors.boardName}
      maxLength={50}
    />
  );

  const renderDescriptionInput = () => (
    <FormInput
      label="Description"
      value={description}
      onChangeText={(text) => {
        setDescription(text);
        if (errors.description) {
          setErrors((prev) => ({ ...prev, description: undefined }));
        }
      }}
      placeholder="Enter board description"
      multiline
      numberOfLines={3}
      error={errors.description}
      maxLength={200}
    />
  );

  const renderBudgetInput = () => (
    <FormInput
      label="Per Person Budget"
      value={perPersonBudget}
      onChangeText={(text) => {
        var numericValue = text.replace(/[^0-9.]/g, "");

        setPerPersonBudget(numericValue);
        if (errors.perPersonBudget) {
          setErrors((prev) => ({ ...prev, perPersonBudget: undefined }));
        }
      }}
      placeholder="Enter budget amount"
      keyboardType="numeric"
      prefix="₹"
      suffix={perPersonBudget ? formatNumber(parseFloat(perPersonBudget)) : ""}
      error={errors.perPersonBudget}
    />
  );

  const renderColorPicker = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.text }]}>Choose Color</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.colorList}
      >
        {BOARD_COLORS.map((color) => (
          <TouchableOpacity
            key={color.id}
            style={[
              styles.colorItem,
              getColorItemStyle(color, selectedColor.id === color.id),
            ]}
            onPress={() => setSelectedColor(color)}
          >
            {selectedColor.id === color.id && (
              <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderIconPicker = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.text }]}>Choose Icon</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.iconList}
      >
        {BOARD_ICONS.sort((a, b) => a.name.length - b.name.length).map(
          (icon) => (
            <TouchableOpacity
              key={icon.id}
              style={[
                styles.iconItem,
                getIconItemStyle(selectedIcon.id === icon.id),
              ]}
              onPress={() => setSelectedIcon(icon)}
            >
              <MaterialCommunityIcons
                name={icon.name}
                size={24}
                color={getIconColor(selectedIcon.id === icon.id)}
              />
              <Text
                style={[
                  styles.iconLabel,
                  {
                    color: getIconLabelColor(selectedIcon.id === icon.id),
                  },
                ]}
              >
                {icon.label}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>
    </View>
  );

  const renderShareOptions = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.text }]}>Share Board</Text>
      <TouchableOpacity
        style={[styles.shareButton, { backgroundColor: theme.primary }]}
        onPress={handleShareBoard}
      >
        <MaterialCommunityIcons
          name="share-variant"
          size={20}
          color={theme.white}
          style={styles.shareIcon}
        />
        <Text style={[styles.shareButtonText, { color: theme.white }]}>
          Share Board
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header title="Expense Board" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { backgroundColor: theme.background },
          ]}
        >
          {renderBoardNameInput()}
          {renderDescriptionInput()}
          {renderBudgetInput()}
          <View
            style={[styles.sectionDivider, { backgroundColor: theme.border }]}
          />
          {renderColorPicker()}
          {renderIconPicker()}
          <View
            style={[styles.sectionDivider, { backgroundColor: theme.border }]}
          />
          {renderShareOptions()}
        </ScrollView>
      </KeyboardAvoidingView>
      <FormButton
        title="Create Board"
        onPress={handleCreateBoard}
        loading={loading}
        style={styles.createButton}
      />
      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        boardName={boardName || "New Expense Board"}
        boardId={shareCode || generateShareCode()}
        boardColor={selectedColor.value}
        boardIcon={selectedIcon.name}
      />
    </SafeAreaView>
  );
};
