import { StyleSheet } from "react-native";
import { spacing, typography } from "../../theme/tokens";

export function createAuthFormStyles(compact = false) {
  return StyleSheet.create({
    field: {
      marginBottom: compact ? spacing.sm : spacing.md,
    },
    label: {
      ...typography.caption,
      fontWeight: "600",
      marginBottom: spacing.xs,
    },
    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderRadius: 10,
      paddingHorizontal: spacing.md,
      minHeight: compact ? 44 : 50,
    },
    inputIcon: { marginRight: spacing.sm },
    input: {
      flex: 1,
      fontSize: compact ? 15 : 16,
      paddingVertical: compact ? spacing.sm : spacing.md,
    },
    eyeBtn: { padding: spacing.xs },
    error: { fontSize: 11, marginTop: 2 },
    forgot: {
      alignSelf: "flex-end",
      marginBottom: compact ? spacing.sm : spacing.md,
      marginTop: -2,
    },
    forgotText: { ...typography.caption },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: compact ? spacing.md : spacing.lg,
      gap: spacing.sm,
    },
    divider: { flex: 1, height: 1 },
    dividerText: { ...typography.caption, fontSize: 12 },
    googleBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      minHeight: compact ? 44 : 48,
      borderRadius: 10,
      borderWidth: 1.5,
    },
    googleText: { ...typography.label, fontSize: compact ? 14 : 15 },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
    },
    footerText: { fontSize: 13 },
    footerLink: { fontSize: 13, fontWeight: "700" },
    referralHint: {
      fontSize: 11,
      lineHeight: 15,
      marginBottom: compact ? spacing.sm : spacing.md,
    },
    submitBtn: { marginTop: compact ? spacing.xs : spacing.sm },
  });
}
