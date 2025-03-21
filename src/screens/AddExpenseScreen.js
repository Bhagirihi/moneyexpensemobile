import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Header } from "../components/Header";
import { CategoryList } from "../components/CategoryList";

const paymentMethods = [
  { id: 1, name: "Cash", icon: "cash", color: "#4CAF50" },
  { id: 2, name: "Card", icon: "credit-card", color: "#2196F3" },
  { id: 3, name: "UPI", icon: "cellphone-banking", color: "#9C27B0" },
  { id: 4, name: "Net Banking", icon: "bank", color: "#FF9800" },
];

const expenseBoards = [
  { id: 1, name: "General", icon: "view-grid", color: "#6C5CE7" },
  { id: 2, name: "GOA", icon: "beach", color: "#FF6B6B" },
  { id: 3, name: "DAMAN", icon: "city", color: "#4ECDC4" },
  { id: 4, name: "MUMBAI", icon: "city-variant", color: "#45B7D1" },
  { id: 5, name: "DELHI", icon: "city-variant-outline", color: "#96CEB4" },
];

export const AddExpenseScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: null,
    paymentMethod: null,
    date: new Date(),
    board: null,
  });

  const handleSave = () => {
    // TODO: Implement save functionality
    navigation.goBack();
  };

  const renderExpenseBoard = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.text }]}>Expense Board</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.boardsList}
      >
        {expenseBoards.map((board) => (
          <TouchableOpacity
            key={board.id}
            style={[
              styles.boardItem,
              {
                backgroundColor:
                  formData.board === board.id ? theme.primary : theme.card,
                borderWidth: formData.board === board.id ? 2 : 1,
                borderColor:
                  formData.board === board.id ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setFormData({ ...formData, board: board.id })}
          >
            <View
              style={[
                styles.boardIcon,
                {
                  backgroundColor: `${board.color}15`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={board.icon}
                size={22}
                color={board.color}
              />
            </View>
            <Text
              style={[
                styles.boardName,
                {
                  color: formData.board === board.id ? theme.white : theme.text,
                },
              ]}
            >
              {board.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAmountInput = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.text }]}>Amount</Text>
      <View
        style={[
          styles.amountInput,
          {
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.currency, { color: theme.textSecondary }]}>$</Text>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={formData.amount}
          onChangeText={(text) => setFormData({ ...formData, amount: text })}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={theme.textSecondary}
        />
      </View>
    </View>
  );

  const renderDescriptionInput = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.text }]}>Description</Text>
      <TextInput
        style={[
          styles.input,
          styles.descriptionInput,
          {
            backgroundColor: theme.card,
            color: theme.text,
            borderWidth: 1,
            borderColor: theme.border,
          },
        ]}
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        placeholder="Enter expense description"
        placeholderTextColor={theme.textSecondary}
        multiline
        numberOfLines={3}
      />
    </View>
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
    <TouchableOpacity
      style={[styles.saveButton, { backgroundColor: theme.primary }]}
      onPress={handleSave}
    >
      <Text style={[styles.saveButtonText, { color: theme.white }]}>
        Save Expense
      </Text>
    </TouchableOpacity>
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
          {renderExpenseBoard()}
          {renderAmountInput()}
          {renderDescriptionInput()}
          <CategoryList
            selectedCategory={formData.category}
            onSelectCategory={(categoryId) =>
              setFormData({ ...formData, category: categoryId })
            }
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
  boardsList: {
    paddingRight: 12,
  },
  boardItem: {
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
  boardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  boardName: {
    fontSize: 13,
    fontWeight: "600",
  },
});
