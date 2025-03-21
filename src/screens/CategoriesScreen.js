import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components/Header";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../config/supabase";
import ListHeader from "../components/common/ListHeader";

const DEFAULT_CATEGORIES = [
  {
    id: "default-1",
    name: "Food",
    icon: "food",
    color: "#FF6B6B",
    description: "Food and dining expenses",
  },
  {
    id: "default-2",
    name: "Transport",
    icon: "car",
    color: "#4ECDC4",
    description: "Transportation costs",
  },
  {
    id: "default-3",
    name: "Shopping",
    icon: "shopping",
    color: "#45B7D1",
    description: "Shopping and retail",
  },
  {
    id: "default-4",
    name: "Entertainment",
    icon: "movie",
    color: "#96CEB4",
    description: "Entertainment and leisure",
  },
  {
    id: "default-5",
    name: "Health",
    icon: "heart",
    color: "#FFEEAD",
    description: "Health and medical expenses",
  },
  {
    id: "default-6",
    name: "Education",
    icon: "book",
    color: "#D4A5A5",
    description: "Education and learning",
  },
  {
    id: "default-7",
    name: "Housing",
    icon: "home",
    color: "#9B59B6",
    description: "Housing and utilities",
  },
  {
    id: "default-8",
    name: "Travel",
    icon: "airplane",
    color: "#3498DB",
    description: "Travel and tourism",
  },
];

const CATEGORY_COLORS = [
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
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
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  categoryActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 16,
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
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    padding: 8,
    borderWidth: 1,
  },
  iconLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  modalButtonText: {
    fontSize: 16,
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
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 4,
    opacity: 0.7,
  },
});

export const CategoriesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: CATEGORY_COLORS[0],
    icon: CATEGORY_ICONS[0],
  });
  const [errors, setErrors] = useState({});

  const fetchCategories = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // If no categories exist, use default categories
      if (!data || data.length === 0) {
        setCategories(DEFAULT_CATEGORIES);
      } else {
        setCategories(data);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch categories");
      // Fallback to default categories on error
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }
    if (formData.name.length > 50) {
      newErrors.name = "Category name must be less than 50 characters";
    }
    if (formData.description.length > 200) {
      newErrors.description = "Description must be less than 200 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color.value,
        icon: formData.icon.name,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("categories")
          .insert([categoryData]);
        if (error) throw error;
      }

      await fetchCategories();
      setModalVisible(false);
      resetForm();
      Alert.alert(
        "Success",
        `Category ${editingCategory ? "updated" : "created"} successfully`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const { error } = await supabase
                .from("categories")
                .delete()
                .eq("id", categoryId);
              if (error) throw error;
              await fetchCategories();
              Alert.alert("Success", "Category deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete category");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      color: CATEGORY_COLORS[0],
      icon: CATEGORY_ICONS[0],
    });
    setErrors({});
    setEditingCategory(null);
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
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
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const renderCategoryItem = ({ item }) => (
    <View style={[styles.categoryItem, { backgroundColor: theme.card }]}>
      <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <MaterialCommunityIcons name={item.icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.categoryInfo}>
        <Text style={[styles.categoryName, { color: theme.text }]}>
          {item.name}
        </Text>
        {item.description && (
          <Text
            style={[styles.categoryDescription, { color: theme.textSecondary }]}
          >
            {item.description}
          </Text>
        )}
      </View>
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openModal(item)}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={20}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
        {!item.id.startsWith("default-") && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}
          >
            <MaterialCommunityIcons
              name="delete"
              size={20}
              color={theme.error}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={closeModal}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingCategory ? "Edit Category" : "New Category"}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>
              Category Name
            </Text>
            <TextInput
              style={[
                errors.name ? styles.input : styles.input,
                {
                  backgroundColor: theme.background,
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
              maxLength={50}
            />
            {errors.name && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                {errors.name}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>
              Description
            </Text>
            <TextInput
              style={[
                errors.description ? styles.input : styles.input,
                {
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: errors.description ? theme.error : theme.border,
                },
              ]}
              placeholder="Enter category description"
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
              maxLength={200}
            />
            {errors.description && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                {errors.description}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>
              Choose Color
            </Text>
            <View style={styles.colorList}>
              {CATEGORY_COLORS.map((color) => (
                <TouchableOpacity
                  key={color.id}
                  style={[
                    styles.colorItem,
                    { backgroundColor: color?.value || theme.background },
                    formData.color.id === color.id && {
                      borderWidth: 2,
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={() => setFormData((prev) => ({ ...prev, color }))}
                >
                  {formData.color.id === color.id && (
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color="#FFFFFF"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>
              Choose Icon
            </Text>
            <View style={styles.iconList}>
              {CATEGORY_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon.id}
                  style={[
                    styles.iconItem,
                    {
                      backgroundColor:
                        formData.icon.id === icon.id
                          ? theme.primary
                          : theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => setFormData((prev) => ({ ...prev, icon }))}
                >
                  <MaterialCommunityIcons
                    name={icon.name}
                    size={24}
                    color={
                      formData.icon.id === icon.id ? theme.white : theme.text
                    }
                  />
                  <Text
                    style={[
                      styles.iconLabel,
                      {
                        color:
                          formData.icon.id === icon.id
                            ? theme.white
                            : theme.text,
                      },
                    ]}
                  >
                    {icon.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[
                styles.modalButton,
                {
                  backgroundColor: theme.background,
                  borderWidth: 1,
                  borderColor: theme.border,
                },
              ]}
              onPress={closeModal}
            >
              <Text style={[styles.modalButtonText, { color: theme.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                {
                  backgroundColor: theme.primary,
                  borderWidth: 0,
                },
              ]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.white} />
              ) : (
                <Text style={[styles.modalButtonText, { color: theme.white }]}>
                  {editingCategory ? "Update" : "Create"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header title="Categories" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : categories.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="folder-plus"
              size={48}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyStateText, { color: theme.text }]}>
              No categories yet. Tap the + button to create one.
            </Text>
          </View>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <ListHeader
                title={
                  categories.some((cat) => cat.id.startsWith("default-"))
                    ? "Default Categories"
                    : "Your Categories"
                }
              />
            }
          />
        )}
      </View>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => openModal()}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      {renderModal()}
    </SafeAreaView>
  );
};
