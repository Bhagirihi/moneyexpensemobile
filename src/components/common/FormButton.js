import React, { memo, useMemo } from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

const FormButton = memo(
  ({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant = "primary",
    size = "medium",
    style,
    textStyle,
    ...props
  }) => {
    const { theme } = useTheme();

    const styles = useMemo(
      () =>
        StyleSheet.create({
          button: {
            height: size === "large" ? 56 : 48,
            borderRadius: 8,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            backgroundColor:
              variant === "primary" ? theme.primary : "transparent",
            borderWidth: variant === "secondary" ? 1 : 0,
            borderColor: theme.primary,
            opacity: disabled ? 0.5 : 1,
            ...style,
          },
          buttonText: {
            fontSize: size === "large" ? 18 : 16,
            fontWeight: "600",
            color: variant === "primary" ? "#FFFFFF" : theme.primary,
            ...textStyle,
          },
          loadingIndicator: {
            marginRight: 8,
          },
        }),
      [theme, variant, size, disabled]
    );

    return (
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <ActivityIndicator
            color={variant === "primary" ? "#FFFFFF" : theme.primary}
            style={styles.loadingIndicator}
          />
        )}
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    );
  }
);

export default FormButton;
