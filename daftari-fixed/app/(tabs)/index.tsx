import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatCard } from "@/components/StatCard";
import { CustomerCard } from "@/components/CustomerCard";
import { EmptyState } from "@/components/EmptyState";
import { useColors, P } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { business } = useAuth();
  const { customers, dashboardStats, refreshing, refresh } = useData();
  const currency = business?.currency ?? "KES";

  const topDebtors = [...customers]
    .filter((c) => c.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={[styles.headerBg, { backgroundColor: colors.primary, paddingTop: topPadding }]}>
          <View style={[styles.headerCircle, { borderColor: "rgba(201,168,76,0.12)" }]} />
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.greetingText, { fontFamily: P.regular }]}>{greeting} 👋</Text>
              <Text style={[styles.bizName, { fontFamily: P.bold }]} numberOfLines={1}>
                {business?.name ?? "Your Business"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/settings")}
              style={[styles.avatarBtn, { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 100 }]}
            >
              <Feather name="user" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Hero balance */}
          <View style={[styles.heroBal, { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: colors.radius }]}>
            <Text style={[styles.heroBalLabel, { fontFamily: P.regular }]}>Total Outstanding</Text>
            <Text style={[styles.heroBalValue, { fontFamily: P.bold }]}>
              {currency} {dashboardStats.total_outstanding.toLocaleString()}
            </Text>
            <View style={styles.heroBalRow}>
              <View style={styles.heroBalItem}>
                <View style={[styles.heroDot, { backgroundColor: colors.accent }]} />
                <Text style={[styles.heroBalSub, { fontFamily: P.regular }]}>
                  {dashboardStats.active_debtors} debtors
                </Text>
              </View>
              <View style={styles.heroBalItem}>
                <View style={[styles.heroDot, { backgroundColor: "#34C78A" }]} />
                <Text style={[styles.heroBalSub, { fontFamily: P.regular }]}>
                  {currency} {dashboardStats.todays_collections.toLocaleString()} today
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <StatCard
              label="Active Debtors"
              value={`${dashboardStats.active_debtors}`}
              icon={<Feather name="users" size={18} color={colors.primary} />}
            />
            <StatCard
              label="Overdue"
              value={`${currency} ${dashboardStats.overdue_amount.toLocaleString()}`}
              icon={<Feather name="alert-circle" size={18} color={colors.destructive} />}
              danger
            />
            <StatCard
              label="Collected Today"
              value={`${currency} ${dashboardStats.todays_collections.toLocaleString()}`}
              icon={<Feather name="trending-up" size={18} color={colors.success} />}
            />
            <StatCard
              label="Total Customers"
              value={`${dashboardStats.total_customers}`}
              icon={<Feather name="book" size={18} color={colors.primary} />}
            />
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            onPress={() => router.push("/customers/add")}
            style={[styles.qAction, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            activeOpacity={0.8}
          >
            <View style={[styles.qIcon, { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 10 }]}>
              <Feather name="user-plus" size={18} color="#fff" />
            </View>
            <Text style={[styles.qLabel, { color: "#fff", fontFamily: P.semibold }]}>Add Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/ai")}
            style={[styles.qAction, { backgroundColor: colors.accent, borderRadius: colors.radius }]}
            activeOpacity={0.8}
          >
            <View style={[styles.qIcon, { backgroundColor: "rgba(0,0,0,0.12)", borderRadius: 10 }]}>
              <Feather name="zap" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.qLabel, { color: colors.primary, fontFamily: P.semibold }]}>AI Assistant</Text>
          </TouchableOpacity>
        </View>

        {/* Top debtors */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: P.bold }]}>
            Top Debtors
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/customers")}>
            <Text style={[styles.seeAll, { color: colors.accent, fontFamily: P.medium }]}>See all →</Text>
          </TouchableOpacity>
        </View>

        {topDebtors.length === 0 ? (
          <EmptyState
            icon="check-circle"
            title="All clear!"
            subtitle="No outstanding debts right now"
          />
        ) : (
          topDebtors.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onPress={() => router.push({ pathname: "/customers/[id]", params: { id: customer.id } })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 0 },
  headerBg: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    position: "relative",
    overflow: "hidden",
  },
  headerCircle: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 40,
    top: -100,
    right: -80,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginBottom: 20,
  },
  greetingText: { fontSize: 13, color: "rgba(255,255,255,0.6)" },
  bizName: { fontSize: 22, color: "#fff", letterSpacing: -0.3, marginTop: 2 },
  avatarBtn: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  heroBal: { padding: 18, gap: 6 },
  heroBalLabel: { fontSize: 12, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 0.8 },
  heroBalValue: { fontSize: 32, color: "#fff", letterSpacing: -1 },
  heroBalRow: { flexDirection: "row", gap: 16, marginTop: 4 },
  heroBalItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroDot: { width: 6, height: 6, borderRadius: 3 },
  heroBalSub: { fontSize: 12, color: "rgba(255,255,255,0.65)" },
  statsSection: { padding: 16, paddingTop: 20 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickActions: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 24 },
  qAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  qIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  qLabel: { fontSize: 14 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17 },
  seeAll: { fontSize: 13 },
});
