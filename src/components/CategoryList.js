import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const categories = [
  { id: 0, name: "All", icon: "view-grid", color: "#6C5CE7" },
  { id: 1, name: "Food", icon: "food", color: "#FF6B6B" },
  { id: 2, name: "Transport", icon: "car", color: "#4ECDC4" },
  { id: 3, name: "Shopping", icon: "shopping", color: "#45B7D1" },
  { id: 4, name: "Entertainment", icon: "movie", color: "#96CEB4" },
  { id: 5, name: "Health", icon: "medical-bag", color: "#FFEEAD" },
  { id: 6, name: "Education", icon: "book-open-variant", color: "#D4A5A5" },
];

export const CategoryList = ({
  selectedCategory,
  onSelectCategory,
  showLabel = true,
  style,
  containerStyle,
}) => {
  const { theme } = useTheme();

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
                name={category.icon}
                size={22}
                color={category.color}
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
