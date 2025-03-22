import React, { memo, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";

const Card = memo(({ children, style, variant, padding = "medium" }) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.card,
          borderRadius: 12,
          padding: padding === "large" ? 20 : padding === "small" ? 12 : 16,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 5,
          ...(variant === "outlined" && {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: theme.border,
          }),
        },
      }),
    [theme, variant, padding]
  );

  return <View style={[styles.card, style]}>{children}</View>;
});

export default Card;
