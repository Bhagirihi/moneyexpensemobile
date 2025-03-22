import React, { memo, useMemo } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";

const FormInput = memo(
  ({
    label,
    error,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType = "default",
    autoCapitalize = "none",
    autoCorrect = false,
    style,
    inputStyle,
    labelStyle,
    errorStyle,
    ...props
  }) => {
    const { theme } = useTheme();

    const styles = useMemo(
      () =>
        StyleSheet.create({
          container: {
            marginBottom: 16,
            ...style,
          },
          label: {
            fontSize: 14,
            fontWeight: "500",
            marginBottom: 8,
            color: theme.text,
            ...labelStyle,
          },
          input: {
            height: 48,
            borderWidth: 1,
            borderColor: error ? theme.error : theme.border,
            borderRadius: 8,
            paddingHorizontal: 16,
            fontSize: 16,
            color: theme.text,
            backgroundColor: theme.card,
            ...inputStyle,
          },
          errorText: {
            fontSize: 12,
            color: theme.error,
            marginTop: 4,
            ...errorStyle,
          },
        }),
      [theme, error]
    );

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          {...props}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

export default FormInput;
