import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { categoryService } from "../services/categoryService";
import { showToast } from "../utils/toast";

export const CategoryList = ({
  selectedCategory,
  onSelectCategory,
  showLabel = true,
  style,
  containerStyle,
}) => {
  const { theme } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();

      if (!data) {
        console.log("No categories found");
        setCategories([]);
        return;
      }

      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showToast("Failed to fetch categories", "error");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, containerStyle]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {showLabel && (
        <Text style={[styles.label, { color: theme.text }]}>Category</Text>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.categoriesList, style]}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              {
                backgroundColor:
                  selectedCategory === category.id ? theme.primary : theme.card,
                borderWidth: selectedCategory === category.id ? 2 : 1,
                borderColor:
                  selectedCategory === category.id
                    ? theme.primary
                    : theme.border,
              },
            ]}
            onPress={() => onSelectCategory(category.id)}
          >
            <View
              style={[
                styles.categoryIcon,
                {
                  backgroundColor: `${category.color}15`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={category.icon || "view-grid"}
                size={22}
                color={category.color || theme.primary}
              />
            </View>
            <Text
              style={[
                styles.categoryName,
                {
                  color:
                    selectedCategory === category.id ? theme.white : theme.text,
                },
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    padding: 12,
  },
  loadingContainer: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.8,
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
});
