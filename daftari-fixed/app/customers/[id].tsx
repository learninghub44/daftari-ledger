import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TransactionRow } from "@/components/TransactionRow";
import { EmptyState } from "@/components/EmptyState";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";

export default function CustomerDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { business } = useAuth();
  const { getCustomerById, getCustomerTransactions, deleteCustomer } = useData();
  const currency = business?.currency ?? "KES";

  const customer = getCustomerById(id);
  const transactions = getCustomerTransactions(id);

  if (!customer) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState icon="user-x" title="Customer not found" />
      </View>
    );
  }

  const statusConfig = {
    current: { label: "Current", variant: "success" as const },
    due_soon: { label: "Due Soon", variant: "warning" as const },
    overdue: { label: "Overdue", variant: "destructive" as const },
  };

  const txnsWithBalance = [...transactions]
    .sort(
      (a, b) =>
        new Date(a.transaction_date).getTime() -
        new Date(b.transaction_date).getTime()
    )
    .reduce<{ tx: typeof transactions[0]; balance: number }[]>((acc, tx) => {
      const prev = acc[acc.length - 1]?.balance ?? 0;
      const newBal =
        tx.type === "credit" ? prev + tx.amount : prev - tx.amount;
      return [...acc, { tx, balance: Math.max(0, newBal) }];
    }, [])
    .reverse();

  const handleWhatsApp = () => {
    if (!customer.phone) {
      Alert.alert("No phone number", "This customer has no phone number saved.");
      return;
    }
    const phone = customer.phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hello ${customer.name}, your outstanding balance is ${currency} ${customer.balance.toLocaleString()}. Kindly clear your balance. Thank you.`
    );
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${message}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Customer",
      `Delete ${customer.name} and all their transaction history? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await deleteCustomer(id);
            if (result.error) {
              Alert.alert("Error", result.error);
            } else {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            }
          },
        },
      ]
    );
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.navHeader,
          {
            paddingTop: topPadding + 4,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text
          style={[
            styles.navTitle,
            { color: colors.foreground, fontFamily: "Poppins_600SemiBold" },
          ]}
          numberOfLines={1}
        >
          {customer.name}
        </Text>
        <View style={styles.navActions}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/customers/edit/[id]",
                params: { id },
              })
            }
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="edit-2" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="trash-2" size={20} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.primary, borderRadius: colors.radius },
              ]}
            >
              <Text
                style={[
                  styles.initials,
                  { color: colors.primaryForeground, fontFamily: "Poppins_700Bold" },
                ]}
              >
                {customer.name
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase() ?? "")
                  .join("")}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text
                style={[
                  styles.customerName,
                  { color: colors.foreground, fontFamily: "Poppins_700Bold" },
                ]}
              >
                {customer.name}
              </Text>
              {customer.phone ? (
                <Text
                  style={[
                    styles.phone,
                    { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" },
                  ]}
                >
                  {customer.phone}
                </Text>
              ) : null}
              {customer.location ? (
                <Text
                  style={[
                    styles.location,
                    { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" },
                  ]}
                >
                  {customer.location}
                </Text>
              ) : null}
              {customer.balance > 0 && (
                <View style={{ marginTop: 6 }}>
                  <Badge
                    label={statusConfig[customer.debt_status].label}
                    variant={statusConfig[customer.debt_status].variant}
                  />
                </View>
              )}
            </View>
          </View>

          <View
            style={[
              styles.balanceBox,
              { backgroundColor: colors.secondary, borderRadius: colors.radius - 2 },
            ]}
          >
            <View style={styles.balanceItem}>
              <Text
                style={[
                  styles.balanceLabel,
                  { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" },
                ]}
              >
                Outstanding Balance
              </Text>
              <Text
                style={[
                  styles.balanceValue,
                  {
                    color:
                      customer.balance > 0 ? colors.destructive : colors.success,
                    fontFamily: "Poppins_700Bold",
                  },
                ]}
              >
                {currency} {customer.balance.toLocaleString()}
              </Text>
            </View>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <View style={styles.balanceItem}>
              <Text
                style={[
                  styles.balanceLabel,
                  { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" },
                ]}
              >
                Transactions
              </Text>
              <Text
                style={[
                  styles.balanceValue,
                  { color: colors.foreground, fontFamily: "Poppins_700Bold" },
                ]}
              >
                {transactions.length}
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/transactions/add-credit",
                params: { customerId: id },
              })
            }
            style={[
              styles.actionBtn,
              { backgroundColor: colors.primary, borderRadius: colors.radius },
            ]}
            activeOpacity={0.8}
          >
            <Feather name="plus-circle" size={18} color={colors.primaryForeground} />
            <Text
              style={[
                styles.actionBtnText,
                { color: colors.primaryForeground, fontFamily: "Poppins_600SemiBold" },
              ]}
            >
              Add Credit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/transactions/add-payment",
                params: { customerId: id },
              })
            }
            style={[
              styles.actionBtn,
              {
                backgroundColor: colors.success + "22",
                borderRadius: colors.radius,
                borderWidth: 1.5,
                borderColor: colors.success + "44",
              },
            ]}
            activeOpacity={0.8}
          >
            <Feather name="check-circle" size={18} color={colors.success} />
            <Text
              style={[
                styles.actionBtnText,
                { color: colors.success, fontFamily: "Poppins_600SemiBold" },
              ]}
            >
              Record Payment
            </Text>
          </TouchableOpacity>
        </View>

        {customer.phone ? (
          <TouchableOpacity
            onPress={handleWhatsApp}
            style={[
              styles.whatsappBtn,
              {
                backgroundColor: "#25D366",
                borderRadius: colors.radius,
              },
            ]}
            activeOpacity={0.8}
          >
            <Feather name="message-circle" size={18} color="#fff" />
            <Text
              style={[
                styles.whatsappText,
                { color: "#fff", fontFamily: "Poppins_600SemiBold" },
              ]}
            >
              Send WhatsApp Reminder
            </Text>
          </TouchableOpacity>
        ) : null}

        <Text
          style={[
            styles.sectionTitle,
            { color: colors.foreground, fontFamily: "Poppins_700Bold" },
          ]}
        >
          Transaction History
        </Text>

        {txnsWithBalance.length === 0 ? (
          <EmptyState
            icon="file-text"
            title="No transactions yet"
            subtitle="Add a credit or payment to get started"
          />
        ) : (
          <Card style={styles.txnCard}>
            {txnsWithBalance.map(({ tx, balance }, i) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                runningBalance={balance}
                showDivider={i < txnsWithBalance.length - 1}
              />
            ))}
          </Card>
        )}

        {customer.notes ? (
          <>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.foreground, fontFamily: "Poppins_700Bold" },
              ]}
            >
              Notes
            </Text>
            <Card style={styles.notesCard}>
              <Text
                style={[
                  styles.notesText,
                  { color: colors.foreground, fontFamily: "Poppins_400Regular" },
                ]}
              >
                {customer.notes}
              </Text>
            </Card>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  navTitle: { flex: 1, fontSize: 17 },
  navActions: { flexDirection: "row", gap: 16 },
  content: { padding: 16, gap: 14 },
  profileCard: { overflow: "hidden" },
  profileTop: {
    flexDirection: "row",
    gap: 14,
    padding: 16,
    alignItems: "flex-start",
  },
  avatar: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontSize: 20 },
  profileInfo: { flex: 1, gap: 3 },
  customerName: { fontSize: 19 },
  phone: { fontSize: 14 },
  location: { fontSize: 13 },
  balanceBox: {
    flexDirection: "row",
    margin: 12,
    marginTop: 0,
    overflow: "hidden",
  },
  balanceItem: {
    flex: 1,
    padding: 14,
    gap: 4,
  },
  divider: { width: 1 },
  balanceLabel: { fontSize: 12 },
  balanceValue: { fontSize: 20 },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    gap: 8,
  },
  actionBtnText: { fontSize: 14 },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    gap: 8,
  },
  whatsappText: { fontSize: 14 },
  sectionTitle: { fontSize: 16, marginTop: 4 },
  txnCard: { overflow: "hidden" },
  notesCard: { padding: 14 },
  notesText: { fontSize: 14, lineHeight: 20 },
});
