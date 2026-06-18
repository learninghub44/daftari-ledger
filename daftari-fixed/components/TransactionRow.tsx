import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors, P } from "@/hooks/useColors";
import { Transaction } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

interface TransactionRowProps {
  transaction: Transaction;
  runningBalance?: number;
  showDivider?: boolean;
}

export function TransactionRow({ transaction, runningBalance, showDivider = true }: TransactionRowProps) {
  const colors = useColors();
  const { business } = useAuth();
  const currency = business?.currency ?? "KES";
  const isCredit = transaction.type === "credit";

  const date = new Date(transaction.transaction_date);
  const dateStr = date.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

  return (
    <View style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: showDivider ? 1 : 0 }]}>
      <View style={[styles.typeIcon, { backgroundColor: isCredit ? "#FEF2F2" : "#ECFDF5", borderRadius: 10 }]}>
        <Feather
          name={isCredit ? "arrow-up-right" : "arrow-down-left"}
          size={15}
          color={isCredit ? colors.destructive : colors.success}
        />
      </View>
      <View style={styles.details}>
        <Text style={[styles.description, { color: colors.foreground, fontFamily: P.medium }]} numberOfLines={1}>
          {transaction.description || (isCredit ? "Credit" : "Payment")}
        </Text>
        <Text style={[styles.date, { color: colors.mutedForeground, fontFamily: P.regular }]}>{dateStr}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: isCredit ? colors.destructive : colors.success, fontFamily: P.semibold }]}>
          {isCredit ? "+" : "-"}{currency} {transaction.amount.toLocaleString()}
        </Text>
        {runningBalance !== undefined && (
          <Text style={[styles.balance, { color: colors.mutedForeground, fontFamily: P.regular }]}>
            Bal: {currency} {runningBalance.toLocaleString()}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  typeIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  details: { flex: 1, gap: 3 },
  description: { fontSize: 14 },
  date: { fontSize: 12 },
  right: { alignItems: "flex-end", gap: 2 },
  amount: { fontSize: 14 },
  balance: { fontSize: 11 },
});
