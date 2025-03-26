import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Header } from "../components/Header";
import { CategoryList } from "../components/CategoryList";
import { ExpenseBoardList } from "../components/ExpenseBoardList";
import FormInput from "../components/common/FormInput";
import FormButton from "../components/common/FormButton";
import { expenseService } from "../services/expenseService";
import { showToast } from "../utils/toast";

const paymentMethods = [
  { id: 1, name: "Cash", icon: "cash", color: "#4CAF50" },
  { id: 2, name: "Card", icon: "credit-card", color: "#2196F3" },
  { id: 3, name: "UPI", icon: "cellphone-banking", color: "#9C27B0" },
  { id: 4, name: "Net Banking", icon: "bank", color: "#FF9800" },
];

export const AddExpenseScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: null,
    paymentMethod: null,
    date: new Date(),
    board: null,
  });

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showToast("Please enter a valid amount", "error");
      return false;
    }
    if (!formData.description.trim()) {
      showToast("Please enter a description", "error");
      return false;
    }
    if (!formData.category) {
      showToast("Please select a category", "error");
      return false;
    }
    if (!formData.paymentMethod) {
      showToast("Please select a payment method", "error");
      return false;
    }
    if (!formData.board) {
      showToast("Please select an expense board", "error");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const expenseData = {
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        category_id: formData.category,
        payment_method: formData.paymentMethod,
        date: formData.date.toISOString(),
        board_id: formData.board,
      };

      await expenseService.createExpense(expenseData);
      showToast.success("Expense added successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error saving expense:", error);
      showToast("Failed to save expense", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = () => {
    navigation.navigate("CreateExpenseBoard", {
      onBoardCreated: (newBoardId) => {
        setFormData({ ...formData, board: newBoardId });
      },
    });
  };

  const handleCreateCategory = () => {
    navigation.navigate("CreateCategory", {
      onCategoryCreated: (newCategoryId) => {
        setFormData({ ...formData, category: newCategoryId });
      },
    });
  };

  const renderAmountInput = () => (
    <FormInput
      label="Amount"
      value={formData.amount}
      onChangeText={(text) => {
        // Only allow numbers and decimal point
        const numericValue = text.replace(/[^0-9.]/g, "");
        // Ensure only one decimal point
        const parts = numericValue.split(".");
        if (parts.length > 2) return;
        setFormData({ ...formData, amount: numericValue });
      }}
      placeholder="Enter amount"
      keyboardType="numeric"
      prefix="$"
    />
  );

  const renderDescriptionInput = () => (
    <FormInput
      label="Description"
      value={formData.description}
      onChangeText={(text) => setFormData({ ...formData, description: text })}
      placeholder="Enter description"
      multiline
      numberOfLines={3}
    />
  );

  const renderPaymentMethodSelector = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.text }]}>Payment Method</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      >
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.categoryItem,
              {
                backgroundColor:
                  formData.paymentMethod === method.id
                    ? theme.primary
                    : theme.card,
                borderWidth: formData.paymentMethod === method.id ? 2 : 1,
                borderColor:
                  formData.paymentMethod === method.id
                    ? theme.primary
                    : theme.border,
              },
            ]}
            onPress={() =>
              setFormData({ ...formData, paymentMethod: method.id })
            }
          >
            <View
              style={[
                styles.categoryIcon,
                {
                  backgroundColor: `${method.color}15`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={method.icon}
                size={22}
                color={method.color}
              />
            </View>
            <Text
              style={[
                styles.categoryName,
                {
                  color:
                    formData.paymentMethod === method.id
                      ? theme.white
                      : theme.text,
                },
              ]}
            >
              {method.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderDateSelector = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.text }]}>Date</Text>
      <TouchableOpacity
        style={[
          styles.dateButton,
          {
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
          },
        ]}
        onPress={() => {
          // TODO: Implement date picker
          showToast("Date picker coming soon", "info");
        }}
      >
        <MaterialCommunityIcons
          name="calendar"
          size={20}
          color={theme.textSecondary}
        />
        <Text style={[styles.dateText, { color: theme.text }]}>
          {formData.date.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSaveButton = () => (
    <FormButton
      title="Save Expense"
      onPress={handleSave}
      loading={loading}
      style={styles.saveButton}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header title="Add Expense" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ExpenseBoardList
            selectedBoard={formData.board}
            onSelectBoard={(boardId) =>
              setFormData({ ...formData, board: boardId })
            }
            onCreateBoard={handleCreateBoard}
          />
          {renderAmountInput()}
          {renderDescriptionInput()}
          <CategoryList
            selectedCategory={formData.category}
            onSelectCategory={(categoryId) =>
              setFormData({ ...formData, category: categoryId })
            }
            onCreateCategory={handleCreateCategory}
          />
          {renderPaymentMethodSelector()}
          {renderDateSelector()}
        </ScrollView>
      </KeyboardAvoidingView>
      {renderSaveButton()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  inputContainer: {
    padding: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.8,
  },
  amountInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  currency: {
    fontSize: 22,
    marginRight: 6,
    opacity: 0.8,
  },
  input: {
    flex: 1,
    fontSize: 22,
    padding: 0,
    fontWeight: "600",
  },
  descriptionInput: {
    padding: 12,
    borderRadius: 10,
    height: 80,
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    fontSize: 15,
  },
  categoriesList: {
    paddingRight: 12,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginRight: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 100,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "600",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dateText: {
    fontSize: 15,
    marginLeft: 8,
    fontWeight: "500",
  },
  saveButton: {
    margin: 12,
    padding: 14,
    borderRadius: 10,
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
  saveButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
