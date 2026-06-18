import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors, P } from "@/hooks/useColors";
import { CustomerWithBalance } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

interface CustomerCardProps {
  customer: CustomerWithBalance;
  onPress: () => void;
}

const statusConfig = {
  current: { color: "#1B8F5E", bg: "#ECFDF5", label: "Current" },
  due_soon: { color: "#D97706", bg: "#FFFBEB", label: "Due Soon" },
  overdue: { color: "#E53935", bg: "#FFF5F5", label: "Overdue" },
};

const avatarColors = [
  "#0D1B3E", "#1A2F6E", "#C9A84C", "#1B8F5E", "#6366F1", "#0891B2", "#9333EA", "#B45309",
];

export function CustomerCard({ customer, onPress }: CustomerCardProps) {
  const colors = useColors();
  const { business } = useAuth();
  const currency = business?.currency ?? "KES";
  const status = statusConfig[customer.debt_status];
  const hasBalance = customer.balance > 0;

  const initials = customer.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const avatarBg = avatarColors[customer.name.charCodeAt(0) % avatarColors.length];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
          shadowColor: "#0D1B3E",
        },
      ]}
    >
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: avatarBg, borderRadius: 14 }]}>
          <Text style={[styles.initials, { fontFamily: P.bold }]}>{initials}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground, fontFamily: P.semibold }]} numberOfLines={1}>
            {customer.name}
          </Text>
          {customer.phone ? (
            <Text style={[styles.phone, { color: colors.mutedForeground, fontFamily: P.regular }]}>
              {customer.phone}
            </Text>
          ) : (
            <Text style={[styles.phone, { color: colors.mutedForeground, fontFamily: P.regular }]}>
              No phone
            </Text>
          )}
          {hasBalance && (
            <View style={[styles.statusChip, { backgroundColor: status.bg, borderRadius: 100 }]}>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              <Text style={[styles.statusText, { color: status.color, fontFamily: P.medium }]}>
                {status.label}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.right}>
        {hasBalance ? (
          <>
            <Text
              style={[
                styles.balance,
                {
                  color: customer.debt_status === "overdue" ? colors.destructive : colors.foreground,
                  fontFamily: P.bold,
                },
              ]}
            >
              {currency} {customer.balance.toLocaleString()}
            </Text>
            <Text style={[styles.balanceSub, { color: colors.mutedForeground, fontFamily: P.regular }]}>
              owed
            </Text>
          </>
        ) : (
          <View style={[styles.settledBadge, { backgroundColor: "#ECFDF5", borderRadius: 100 }]}>
            <Feather name="check" size={11} color={colors.success} />
            <Text style={[styles.settledText, { color: colors.success, fontFamily: P.semibold }]}>Paid</Text>
          </View>
        )}
        <Feather name="chevron-right" size={16} color={colors.border} style={{ marginTop: 4 }} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  left: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 46, height: 46, alignItems: "center", justifyContent: "center" },
  initials: { fontSize: 15, color: "#FFFFFF" },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 15 },
  phone: { fontSize: 12 },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 11 },
  right: { alignItems: "flex-end", gap: 2 },
  balance: { fontSize: 15 },
  balanceSub: { fontSize: 11 },
  settledBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  settledText: { fontSize: 11 },
});
