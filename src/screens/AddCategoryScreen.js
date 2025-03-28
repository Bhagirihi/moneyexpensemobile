import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components/Header";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { categoryService } from "../services/categoryService";
import { showToast } from "../utils/toast";

// Constants
const CATEGORY_COLORS = [
  { id: "red", value: "#FF6B6B", label: "Red" },
  { id: "teal", value: "#4ECDC4", label: "Teal" },
  { id: "blue", value: "#45B7D1", label: "Blue" },
  { id: "green", value: "#96CEB4", label: "Green" },
  { id: "yellow", value: "#FFEEAD", label: "Yellow" },
  { id: "pink", value: "#D4A5A5", label: "Pink" },
  { id: "purple", value: "#9B59B6", label: "Purple" },
  { id: "navy", value: "#3498DB", label: "Navy" },
  { id: "orange", value: "#E67E22", label: "Orange" },
  { id: "mint", value: "#1ABC9C", label: "Mint" },
];

const CATEGORY_ICONS = [
  { id: "food", name: "food", label: "Food" },
  { id: "transport", name: "car", label: "Transport" },
  { id: "shopping", name: "shopping", label: "Shopping" },
  { id: "entertainment", name: "movie", label: "Entertainment" },
  { id: "utilities", name: "flash", label: "Utilities" },
  { id: "health", name: "heart", label: "Health" },
  { id: "education", name: "book", label: "Education" },
  { id: "housing", name: "home", label: "Housing" },
  { id: "travel", name: "airplane", label: "Travel" },
  { id: "other", name: "dots-horizontal", label: "Other" },
];

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 200;

export const AddCategoryScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: CATEGORY_COLORS[0],
    icon: CATEGORY_ICONS[0],
  });
  const [errors, setErrors] = useState({});

  // Initialize form data if editing existing category
  useEffect(() => {
    if (route.params?.category) {
      const { category } = route.params;
      setFormData({
        name: category.name,
        description: category.description || "",
        color:
          CATEGORY_COLORS.find((c) => c.value === category.color) ||
          CATEGORY_COLORS[0],
        icon:
          CATEGORY_ICONS.find((i) => i.name === category.icon) ||
          CATEGORY_ICONS[0],
      });
    }
  }, [route.params?.category]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (formData.name.length > MAX_NAME_LENGTH) {
      newErrors.name = `Category name must be less than ${MAX_NAME_LENGTH} characters`;
    }

    if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color.value,
        icon: formData.icon.name,
      };

      const { error } = await categoryService.createCategory(categoryData);

      if (error) {
        showToast(error.message || "Failed to create category", "error");
        return;
      }

      showToast("Category created successfully", "success");
      if (route.params?.onCategoryCreated) {
        route.params.onCategoryCreated(formData.id);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error saving category:", error);
      showToast("An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const getIconStyle = (iconId) => ({
    backgroundColor: formData.icon.id === iconId ? theme.primary : theme.card,
    borderColor: theme.border,
  });

  const getIconColor = (iconId) =>
    formData.icon.id === iconId ? theme.white : theme.text;

  const renderColorPicker = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.text }]}>Choose Color</Text>
      <View style={styles.colorList}>
        {CATEGORY_COLORS.map((color) => (
          <TouchableOpacity
            key={color.id}
            style={[
              styles.colorItem,
              { backgroundColor: color.value || theme.card },
              formData.color.id === color.id && {
                borderWidth: 2,
                borderColor: theme.primary,
              },
            ]}
            onPress={() => setFormData((prev) => ({ ...prev, color }))}
          >
            {formData.color.id === color.id && (
              <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
  const sortedIcons = CATEGORY_ICONS.sort((a, b) => {
    if (a.id === "other") return 1; // Push "other" to the end
    if (b.id === "other") return -1;
    return a.label.length - b.label.length; // Sort by label length
  });

  const renderIconPicker = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.text }]}>Choose Icon</Text>
      <View style={styles.iconList}>
        {sortedIcons.map((icon) => (
          <TouchableOpacity
            key={icon.id}
            style={[styles.iconItem, getIconStyle(icon.id)]}
            onPress={() => setFormData((prev) => ({ ...prev, icon }))}
          >
            <MaterialCommunityIcons
              name={icon.name}
              size={24}
              color={getIconColor(icon.id)}
            />
            <Text style={[styles.iconLabel, { color: getIconColor(icon.id) }]}>
              {icon.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title={route.params?.category ? "Edit Category" : "Add Category"}
        onBack={() => navigation.goBack()}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>
            Category Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: errors.name ? theme.error : theme.border,
              },
            ]}
            placeholder="Enter category name"
            placeholderTextColor={theme.textSecondary}
            value={formData.name}
            onChangeText={(text) => {
              setFormData((prev) => ({ ...prev, name: text }));
              if (errors.name) {
                setErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            maxLength={MAX_NAME_LENGTH}
          />
          {errors.name && (
            <Text style={[styles.errorText, { color: theme.error }]}>
              {errors.name}
            </Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Description</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: errors.description ? theme.error : theme.border,
                height: 100,
              },
            ]}
            placeholder="Enter category description (optional)"
            placeholderTextColor={theme.textSecondary}
            value={formData.description}
            onChangeText={(text) => {
              setFormData((prev) => ({ ...prev, description: text }));
              if (errors.description) {
                setErrors((prev) => ({ ...prev, description: undefined }));
              }
            }}
            multiline
            numberOfLines={3}
            maxLength={MAX_DESCRIPTION_LENGTH}
          />
          {errors.description && (
            <Text style={[styles.errorText, { color: theme.error }]}>
              {errors.description}
            </Text>
          )}
        </View>

        {renderColorPicker()}
        {renderIconPicker()}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.saveButton,
          {
            backgroundColor: theme.primary,
            opacity: loading ? 0.7 : 1,
          },
        ]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.white} />
        ) : (
          <Text style={[styles.saveButtonText, { color: theme.white }]}>
            {route.params?.category ? "Update Category" : "Create Category"}
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
  },
  colorList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  colorItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    margin: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  iconList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  iconItem: {
    width: "auto",
    minWidth: 80,
    height: 60,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    padding: 10,
    borderWidth: 1,
  },
  iconLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
