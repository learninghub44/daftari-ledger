import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors, P } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";

const { width: SCREEN_W } = Dimensions.get("window");
const BAR_CONTAINER_W = SCREEN_W - 80;

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { business } = useAuth();
  const { customers, transactions, dashboardStats } = useData();
  const currency = business?.currency ?? "KES";
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const topDebtors = useMemo(() =>
    [...customers].filter(c => c.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 8),
    [customers]);

  const monthlyCollections = useMemo(() => {
    const months: Record<string, number> = {};
    transactions.filter(t => t.type === "payment").forEach(t => {
      const key = t.transaction_date.slice(0, 7);
      months[key] = (months[key] ?? 0) + t.amount;
    });
    return Object.entries(months).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6).reverse();
  }, [transactions]);

  const maxCollection = useMemo(() => Math.max(...monthlyCollections.map(([, v]) => v), 1), [monthlyCollections]);

  const collectionRate = dashboardStats.total_outstanding + dashboardStats.total_payments > 0
    ? Math.round((dashboardStats.total_payments / (dashboardStats.total_outstanding + dashboardStats.total_payments)) * 100)
    : 0;

  const handleExport = (type: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert("Export", `${type} export coming in the next update.`, [{ text: "OK" }]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPadding + 12, paddingBottom: insets.bottom + 110 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: P.bold }]}>Reports</Text>
        <Text style={[styles.pageDate, { color: colors.mutedForeground, fontFamily: P.regular }]}>
          {new Date().toLocaleDateString("en-KE", { month: "long", year: "numeric" })}
        </Text>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { backgroundColor: colors.primary, borderRadius: colors.radius }]}>
          <Text style={[styles.kpiLabel, { color: "rgba(255,255,255,0.65)", fontFamily: P.regular }]}>Total Outstanding</Text>
          <Text style={[styles.kpiValue, { color: "#fff", fontFamily: P.bold }]}>
            {currency} {dashboardStats.total_outstanding.toLocaleString()}
          </Text>
          <Text style={[styles.kpiSub, { color: "rgba(255,255,255,0.5)", fontFamily: P.regular }]}>
            {dashboardStats.active_debtors} active debtors
          </Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: colors.success + "18", borderRadius: colors.radius }]}>
          <Text style={[styles.kpiLabel, { color: colors.success, fontFamily: P.regular }]}>Total Collected</Text>
          <Text style={[styles.kpiValue, { color: colors.success, fontFamily: P.bold }]}>
            {currency} {dashboardStats.total_payments.toLocaleString()}
          </Text>
          <Text style={[styles.kpiSub, { color: colors.success, fontFamily: P.regular, opacity: 0.7 }]}>Collection rate: {collectionRate}%</Text>
        </View>
      </View>

      {/* Collection Rate Bar */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: P.bold }]}>Collection Rate</Text>
          <Text style={[styles.cardBadge, { color: colors.accent, fontFamily: P.semibold }]}>{collectionRate}%</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.muted, borderRadius: 100 }]}>
          <View style={[styles.progressFill, { width: `${collectionRate}%`, backgroundColor: collectionRate > 70 ? colors.success : collectionRate > 40 ? colors.warning : colors.destructive, borderRadius: 100 }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressLabel, { color: colors.mutedForeground, fontFamily: P.regular }]}>0%</Text>
          <Text style={[styles.progressLabel, { color: colors.mutedForeground, fontFamily: P.regular }]}>100%</Text>
        </View>
      </View>

      {/* Monthly Collections Bar Chart */}
      {monthlyCollections.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: P.bold }]}>Monthly Collections</Text>
            <View style={[styles.cardChip, { backgroundColor: colors.muted, borderRadius: 100 }]}>
              <Feather name="trending-up" size={12} color={colors.success} />
              <Text style={[styles.cardChipText, { color: colors.success, fontFamily: P.medium }]}>Last 6 months</Text>
            </View>
          </View>
          <View style={styles.barChart}>
            {monthlyCollections.map(([month, amount]) => {
              const barH = Math.max(4, (amount / maxCollection) * 100);
              const label = new Date(month + "-01").toLocaleDateString("en-KE", { month: "short" });
              return (
                <View key={month} style={styles.barCol}>
                  <Text style={[styles.barValue, { color: colors.mutedForeground, fontFamily: P.regular }]}>
                    {amount > 999 ? `${(amount / 1000).toFixed(0)}K` : amount}
                  </Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: barH, backgroundColor: colors.primary, borderRadius: 6 }]} />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.mutedForeground, fontFamily: P.regular }]}>{label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Summary Stats */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius, overflow: "hidden" }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: P.bold, padding: 16, paddingBottom: 12 }]}>Summary</Text>
        {[
          { label: "Total Customers", value: `${dashboardStats.total_customers}`, icon: "users" as const, color: colors.primary },
          { label: "Outstanding", value: `${currency} ${dashboardStats.total_outstanding.toLocaleString()}`, icon: "credit-card" as const, color: colors.warning },
          { label: "Overdue", value: `${currency} ${dashboardStats.overdue_amount.toLocaleString()}`, icon: "alert-triangle" as const, color: colors.destructive },
          { label: "Collected", value: `${currency} ${dashboardStats.total_payments.toLocaleString()}`, icon: "check-circle" as const, color: colors.success },
        ].map((row, i) => (
          <View key={row.label} style={[styles.summaryRow, { borderTopWidth: i > 0 ? 1 : 0, borderTopColor: colors.border }]}>
            <View style={[styles.summaryIcon, { backgroundColor: row.color + "18", borderRadius: 8 }]}>
              <Feather name={row.icon} size={14} color={row.color} />
            </View>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: P.regular }]}>{row.label}</Text>
            <Text style={[styles.summaryValue, { color: row.color, fontFamily: P.semibold }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      {/* Top Debtors */}
      {topDebtors.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius, overflow: "hidden" }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: P.bold, padding: 16, paddingBottom: 12 }]}>Top Debtors</Text>
          {topDebtors.map((c, i) => {
            const barPct = (c.balance / (topDebtors[0]?.balance || 1)) * 100;
            return (
              <View key={c.id} style={[styles.debtorRow, { borderTopWidth: i > 0 ? 1 : 0, borderTopColor: colors.border }]}>
                <View style={[styles.rankBadge, { backgroundColor: i < 3 ? colors.primary : colors.muted, borderRadius: 8 }]}>
                  <Text style={[styles.rankText, { color: i < 3 ? "#fff" : colors.mutedForeground, fontFamily: P.bold }]}>{i + 1}</Text>
                </View>
                <View style={styles.debtorContent}>
                  <View style={styles.debtorNameRow}>
                    <Text style={[styles.debtorName, { color: colors.foreground, fontFamily: P.medium }]} numberOfLines={1}>{c.name}</Text>
                    <Text style={[styles.debtorBal, { color: c.debt_status === "overdue" ? colors.destructive : colors.foreground, fontFamily: P.bold }]}>
                      {currency} {c.balance.toLocaleString()}
                    </Text>
                  </View>
                  <View style={[styles.miniTrack, { backgroundColor: colors.muted, borderRadius: 100 }]}>
                    <View style={[styles.miniFill, { width: `${barPct}%`, backgroundColor: c.debt_status === "overdue" ? colors.destructive : colors.primary, borderRadius: 100 }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Export */}
      <View style={styles.exportSection}>
        <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: P.bold, marginBottom: 10 }]}>Export Data</Text>
        <View style={styles.exportGrid}>
          {[
            { label: "PDF\nStatement", icon: "file-text" as const, color: "#EF4444" },
            { label: "Excel\nReport", icon: "grid" as const, color: "#16A34A" },
            { label: "CSV\nExport", icon: "download" as const, color: "#2563EB" },
          ].map(item => (
            <TouchableOpacity key={item.label} onPress={() => handleExport(item.label)} activeOpacity={0.7}
              style={[styles.exportCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <View style={[styles.exportIconWrap, { backgroundColor: item.color + "18", borderRadius: 12 }]}>
                <Feather name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={[styles.exportLabel, { color: colors.foreground, fontFamily: P.medium }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 14 },
  pageHeader: { gap: 2 },
  pageTitle: { fontSize: 28, letterSpacing: -0.5 },
  pageDate: { fontSize: 13 },
  kpiGrid: { flexDirection: "row", gap: 10 },
  kpiCard: { flex: 1, padding: 16, gap: 4 },
  kpiLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  kpiValue: { fontSize: 20, letterSpacing: -0.5 },
  kpiSub: { fontSize: 11 },
  card: { borderWidth: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, paddingBottom: 12 },
  cardTitle: { fontSize: 15 },
  cardBadge: { fontSize: 18 },
  cardChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4 },
  cardChipText: { fontSize: 11 },
  progressTrack: { height: 10, marginHorizontal: 16, overflow: "hidden" },
  progressFill: { height: "100%" },
  progressLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 6, paddingBottom: 14 },
  progressLabel: { fontSize: 11 },
  barChart: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 16, paddingBottom: 16, gap: 8, height: 160 },
  barCol: { flex: 1, alignItems: "center", gap: 4 },
  barTrack: { height: 100, justifyContent: "flex-end", width: "100%" },
  barFill: { width: "100%", minHeight: 4 },
  barValue: { fontSize: 9 },
  barLabel: { fontSize: 10 },
  summaryRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  summaryIcon: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  summaryLabel: { flex: 1, fontSize: 14 },
  summaryValue: { fontSize: 14 },
  debtorRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  rankBadge: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  rankText: { fontSize: 12 },
  debtorContent: { flex: 1, gap: 6 },
  debtorNameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  debtorName: { fontSize: 14, flex: 1 },
  debtorBal: { fontSize: 14 },
  miniTrack: { height: 4, overflow: "hidden" },
  miniFill: { height: "100%" },
  exportSection: {},
  exportGrid: { flexDirection: "row", gap: 10 },
  exportCard: { flex: 1, alignItems: "center", paddingVertical: 18, gap: 10, borderWidth: 1 },
  exportIconWrap: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  exportLabel: { fontSize: 12, textAlign: "center", lineHeight: 17 },
});
