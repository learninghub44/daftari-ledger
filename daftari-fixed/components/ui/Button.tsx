import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { useColors, P } from "@/hooks/useColors";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "accent";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  label?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  label,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const colors = useColors();

  const variantStyles = {
    primary: { backgroundColor: colors.primary, borderColor: "transparent", borderWidth: 0 },
    accent: { backgroundColor: colors.accent, borderColor: "transparent", borderWidth: 0 },
    secondary: { backgroundColor: colors.secondary, borderColor: "transparent", borderWidth: 0 },
    outline: { backgroundColor: "transparent", borderColor: colors.border, borderWidth: 1.5 },
    ghost: { backgroundColor: "transparent", borderColor: "transparent", borderWidth: 0 },
    destructive: { backgroundColor: colors.destructive, borderColor: "transparent", borderWidth: 0 },
  };

  const textColors = {
    primary: "#FFFFFF",
    accent: colors.primary,
    secondary: colors.foreground,
    outline: colors.foreground,
    ghost: colors.foreground,
    destructive: "#FFFFFF",
  };

  const sizes = {
    sm: { height: 38, paddingHorizontal: 16, fontSize: 13 },
    md: { height: 48, paddingHorizontal: 20, fontSize: 15 },
    lg: { height: 54, paddingHorizontal: 24, fontSize: 16 },
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[
        styles.base,
        {
          borderRadius: 100,
          height: sizes[size].height,
          paddingHorizontal: sizes[size].paddingHorizontal,
          ...variantStyles[variant],
          opacity: isDisabled ? 0.5 : 1,
          width: fullWidth ? "100%" : undefined,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColors[variant]} />
      ) : (
        <View style={styles.content}>
          {leftIcon}
          {(children || label) && (
            <Text
              style={{
                color: textColors[variant],
                fontSize: sizes[size].fontSize,
                fontFamily: P.semibold,
                letterSpacing: 0.1,
              }}
            >
              {children ?? label}
            </Text>
          )}
          {rightIcon}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center" },
  content: { flexDirection: "row", alignItems: "center", gap: 8 },
});
