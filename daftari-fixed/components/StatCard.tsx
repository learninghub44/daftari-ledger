import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors, P } from "@/hooks/useColors";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
  danger?: boolean;
}

export function StatCard({ label, value, icon, accent = false, danger = false }: StatCardProps) {
  const colors = useColors();

  const bg = accent ? colors.primary : danger ? "#FFF5F5" : colors.card;
  const textColor = accent ? "#FFFFFF" : danger ? colors.destructive : colors.foreground;
  const subColor = accent ? "rgba(255,255,255,0.6)" : danger ? "#FCA5A5" : colors.mutedForeground;
  const iconBg = accent
    ? "rgba(255,255,255,0.15)"
    : danger
    ? "#FEE2E2"
    : colors.muted;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bg,
          borderRadius: colors.radius,
          borderWidth: accent || danger ? 0 : 1,
          borderColor: colors.border,
          shadowColor: accent ? colors.primary : "#000",
          shadowOffset: { width: 0, height: accent ? 4 : 1 },
          shadowOpacity: accent ? 0.25 : 0.05,
          shadowRadius: accent ? 12 : 4,
          elevation: accent ? 6 : 1,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBg, borderRadius: 10 }]}>
        {icon}
      </View>
      <Text
        style={[styles.value, { color: textColor, fontFamily: P.bold }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text style={[styles.label, { color: subColor, fontFamily: P.regular }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    flex: 1,
    minWidth: "45%",
    gap: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  value: { fontSize: 22, letterSpacing: -0.5 },
  label: { fontSize: 12, lineHeight: 16 },
});
