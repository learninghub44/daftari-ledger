import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomerCard } from "@/components/CustomerCard";
import { EmptyState } from "@/components/EmptyState";
import { useColors, P } from "@/hooks/useColors";
import { useData, CustomerWithBalance } from "@/context/DataContext";

type FilterOption = "all" | "current" | "due_soon" | "overdue" | "settled";

const FILTERS: { key: FilterOption; label: string; color?: string }[] = [
  { key: "all", label: "All" },
  { key: "overdue", label: "Overdue", color: "#E53935" },
  { key: "due_soon", label: "Due Soon", color: "#D97706" },
  { key: "current", label: "Current", color: "#1B8F5E" },
  { key: "settled", label: "Settled", color: "#6366F1" },
];

export default function CustomersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customers, dashboardStats, refreshing, refresh } = useData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");

  const filtered = useMemo(() => {
    let list = [...customers];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q)));
    }
    if (filter === "settled") list = list.filter(c => c.balance === 0);
    else if (filter !== "all") list = list.filter(c => c.balance > 0 && c.debt_status === filter);
    return list.sort((a, b) => b.balance - a.balance);
  }, [customers, search, filter]);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const renderHeader = () => (
    <View style={[styles.listHeader, { backgroundColor: colors.background, paddingTop: topPadding + 6 }]}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <View>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: P.bold }]}>Customers</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: P.regular }]}>
            {dashboardStats.total_customers} total · {dashboardStats.active_debtors} with balance
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/customers/add")} activeOpacity={0.85}
          style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: 100 }]}>
          <Feather name="plus" size={18} color="#fff" />
          <Text style={[styles.addBtnText, { fontFamily: P.semibold }]}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14 }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground, fontFamily: P.regular }]}
          placeholder="Search name or phone…"
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <View style={[styles.clearBtn, { backgroundColor: colors.muted, borderRadius: 100 }]}>
              <Feather name="x" size={12} color={colors.mutedForeground} />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map(f => {
          const active = filter === f.key;
          return (
            <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} activeOpacity={0.75}
              style={[styles.filterChip, {
                backgroundColor: active ? (f.color ?? colors.primary) : colors.muted,
                borderRadius: 100,
              }]}>
              {f.color && <View style={[styles.filterDot, { backgroundColor: active ? "#fff" : f.color }]} />}
              <Text style={[styles.filterText, { color: active ? "#fff" : colors.mutedForeground, fontFamily: P.medium }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Result count */}
      <View style={styles.countRow}>
        <Text style={[styles.countText, { color: colors.mutedForeground, fontFamily: P.regular }]}>
          {filtered.length} customer{filtered.length !== 1 ? "s" : ""}
        </Text>
        <Text style={[styles.countText, { color: colors.mutedForeground, fontFamily: P.regular }]}>
          {filter !== "all" && filter !== "settled" ? "↑ sorted by balance" : ""}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList<CustomerWithBalance>
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onPress={() => router.push({ pathname: "/customers/[id]", params: { id: item.id } })}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="users"
            title={search ? "No customers found" : "No customers yet"}
            subtitle={search ? "Try a different name or phone number" : "Tap Add to register your first customer"}
            actionLabel={search ? undefined : "Add Customer"}
            onAction={search ? undefined : () => router.push("/customers/add")}
          />
        }
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listHeader: { paddingBottom: 6 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 28, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, marginTop: 2 },
  addBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  addBtnText: { color: "#fff", fontSize: 14 },
  searchWrap: { flexDirection: "row", alignItems: "center", height: 48, paddingHorizontal: 14, gap: 10, marginHorizontal: 16, marginBottom: 10, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15 },
  clearBtn: { width: 20, height: 20, alignItems: "center", justifyContent: "center" },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 2 },
  filterChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, gap: 6 },
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  filterText: { fontSize: 13 },
  countRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  countText: { fontSize: 12 },
  list: { gap: 0 },
});
