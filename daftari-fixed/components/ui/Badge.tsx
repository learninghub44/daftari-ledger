import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

type BadgeVariant = "default" | "success" | "warning" | "destructive" | "outline";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = "default" }: BadgeProps) {
  const colors = useColors();

  const variants = {
    default: { bg: colors.secondary, text: colors.secondaryForeground },
    success: { bg: "#E8F5E9", text: colors.success },
    warning: { bg: "#FFF3E0", text: colors.warning },
    destructive: { bg: "#FFEBEE", text: colors.destructive },
    outline: { bg: "transparent", text: colors.mutedForeground },
  };

  const v = variants[variant];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: v.bg,
          borderRadius: 100,
          borderWidth: variant === "outline" ? 1 : 0,
          borderColor: colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: v.text, fontFamily: "Poppins_600SemiBold" },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});
