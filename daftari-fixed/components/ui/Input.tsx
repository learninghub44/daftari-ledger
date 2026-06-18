import React, { forwardRef } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { useColors, P } from "@/hooks/useColors";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, leftIcon, rightIcon, style, ...props }, ref) => {
    const colors = useColors();

    return (
      <View style={styles.container}>
        {label && (
          <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: P.medium }]}>
            {label.toUpperCase()}
          </Text>
        )}
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.muted,
              borderColor: error ? colors.destructive : colors.border,
              borderRadius: 12,
            },
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: colors.foreground,
                fontFamily: P.regular,
                paddingLeft: leftIcon ? 0 : 16,
                paddingRight: rightIcon ? 0 : 16,
              },
              style,
            ]}
            placeholderTextColor={colors.mutedForeground}
            {...props}
          />
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
        {error && (
          <Text style={[styles.error, { color: colors.destructive, fontFamily: P.regular }]}>
            {error}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 11, letterSpacing: 0.8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    height: 52,
  },
  input: { flex: 1, fontSize: 15, height: "100%" },
  leftIcon: { paddingLeft: 14, paddingRight: 10 },
  rightIcon: { paddingLeft: 10, paddingRight: 14 },
  error: { fontSize: 12 },
});
