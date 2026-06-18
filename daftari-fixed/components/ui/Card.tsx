import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({ children, style, elevated = false, ...props }: CardProps) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
          shadowColor: colors.foreground,
          elevation: elevated ? 4 : 1,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

interface PressableCardProps extends TouchableOpacityProps {
  elevated?: boolean;
}

export function PressableCard({
  children,
  style,
  elevated = false,
  ...props
}: PressableCardProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
          shadowColor: colors.foreground,
          elevation: elevated ? 4 : 1,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    overflow: "hidden",
  },
});
