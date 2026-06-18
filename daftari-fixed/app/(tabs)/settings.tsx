import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useColors, P } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";

const CURRENCIES = ["KES", "USD", "UGX", "TZS", "GHS", "NGN"];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, business, signOut, updateBusiness } = useAuth();
  const { dashboardStats } = useData();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [bizName, setBizName] = useState(business?.name ?? "");
  const [phone, setPhone] = useState(business?.phone ?? "");
  const [location, setLocation] = useState(business?.location ?? "");
  const [currency, setCurrency] = useState(business?.currency ?? "KES");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!bizName.trim()) {
      Alert.alert("Error", "Business name is required");
      return;
    }
    setSaving(true);
    const result = await updateBusiness({ name: bizName.trim(), phone: phone.trim(), location: location.trim(), currency });
    setSaving(false);
    if (result.error) {
      Alert.alert("Error", result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      setSaved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); await signOut(); } },
    ]);
  };

  const initials = (business?.name ?? "B").split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");
  const currency_ = business?.currency ?? "KES";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Header */}
      <View style={[styles.hero, { backgroundColor: colors.primary, paddingTop: topPadding + 8 }]}>
        <View style={[styles.heroCircle, { borderColor: "rgba(201,168,76,0.12)" }]} />
        <View style={styles.heroInner}>
          <View style={[styles.bigAvatar, { backgroundColor: colors.accent, borderRadius: 30 }]}>
            <Text style={[styles.bigAvatarText, { fontFamily: P.bold }]}>{initials}</Text>
          </View>
          <View style={styles.heroInfo}>
            <Text style={[styles.heroName, { fontFamily: P.bold }]} numberOfLines={1}>
              {business?.name ?? "My Business"}
            </Text>
            <Text style={[styles.heroEmail, { fontFamily: P.regular }]}>{user?.email}</Text>
            <View style={[styles.heroBadge, { backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 100 }]}>
              <View style={[styles.greenDot, { backgroundColor: "#34C78A" }]} />
              <Text style={[styles.heroBadgeText, { fontFamily: P.medium }]}>Active Business</Text>
            </View>
          </View>
        </View>

        {/* Stats strip */}
        <View style={[styles.statsStrip, { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 14 }]}>
          {[
            { label: "Customers", value: `${dashboardStats.total_customers}`, icon: "users" as const },
            { label: "Active Debts", value: `${dashboardStats.active_debtors}`, icon: "alert-circle" as const },
            { label: "Collected", value: `${currency_} ${(dashboardStats.total_payments / 1000).toFixed(0)}K`, icon: "trending-up" as const },
          ].map((s, i) => (
            <View key={s.label} style={[styles.stripItem, i > 0 && { borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.12)" }]}>
              <Text style={[styles.stripValue, { fontFamily: P.bold }]}>{s.value}</Text>
              <Text style={[styles.stripLabel, { fontFamily: P.regular }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.body}>
        {/* Business Profile */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.muted, borderRadius: 10 }]}>
              <Feather name="briefcase" size={14} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: P.bold }]}>Business Profile</Text>
          </View>
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={styles.formInner}>
              <Input label="Business Name" value={bizName} onChangeText={setBizName} placeholder="Your business name" autoCapitalize="words" leftIcon={<Feather name="briefcase" size={16} color={colors.mutedForeground} />} />
              <Input label="Phone Number" value={phone} onChangeText={setPhone} placeholder="+254 700 000 000" keyboardType="phone-pad" leftIcon={<Feather name="phone" size={16} color={colors.mutedForeground} />} />
              <Input label="Location" value={location} onChangeText={setLocation} placeholder="City, Area" autoCapitalize="words" leftIcon={<Feather name="map-pin" size={16} color={colors.mutedForeground} />} />

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: P.medium }]}>CURRENCY</Text>
                <View style={styles.currencyGrid}>
                  {CURRENCIES.map((c) => (
                    <TouchableOpacity key={c} onPress={() => setCurrency(c)} style={[styles.currencyChip, { backgroundColor: currency === c ? colors.primary : colors.muted, borderRadius: 10, borderWidth: 1.5, borderColor: currency === c ? colors.primary : colors.border }]}>
                      <Text style={[styles.currencyText, { color: currency === c ? "#fff" : colors.foreground, fontFamily: P.semibold }]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.85} style={[styles.saveBtn, { backgroundColor: saved ? colors.success : colors.primary, borderRadius: 100, opacity: saving ? 0.7 : 1 }]}>
                {saving ? <Text style={[styles.saveBtnText, { fontFamily: P.semibold }]}>Saving…</Text> :
                  saved ? (
                    <View style={styles.savedRow}><Feather name="check" size={16} color="#fff" /><Text style={[styles.saveBtnText, { fontFamily: P.semibold }]}>Saved!</Text></View>
                  ) : <Text style={[styles.saveBtnText, { fontFamily: P.semibold }]}>Save Changes</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.muted, borderRadius: 10 }]}>
              <Feather name="user" size={14} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: P.bold }]}>Account</Text>
          </View>
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius, overflow: "hidden" }]}>
            {[
              { icon: "mail" as const, label: "Email address", value: user?.email ?? "" },
              { icon: "calendar" as const, label: "Member since", value: user?.created_at ? new Date(user.created_at).toLocaleDateString("en-KE", { month: "long", year: "numeric" }) : "" },
            ].map((item, i) => (
              <View key={item.label} style={[styles.accountRow, { borderTopWidth: i > 0 ? 1 : 0, borderTopColor: colors.border }]}>
                <View style={[styles.accountIconWrap, { backgroundColor: colors.muted, borderRadius: 10 }]}>
                  <Feather name={item.icon} size={14} color={colors.mutedForeground} />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={[styles.accountLabel, { color: colors.mutedForeground, fontFamily: P.regular }]}>{item.label}</Text>
                  <Text style={[styles.accountValue, { color: colors.foreground, fontFamily: P.medium }]} numberOfLines={1}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconWrap, { backgroundColor: "#FEF2F2", borderRadius: 10 }]}>
              <Feather name="shield" size={14} color={colors.destructive} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: P.bold }]}>Danger Zone</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} activeOpacity={0.85} style={[styles.signOutBtn, { backgroundColor: "#FEF2F2", borderColor: "#FECACA", borderRadius: colors.radius }]}>
            <Feather name="log-out" size={18} color={colors.destructive} />
            <Text style={[styles.signOutText, { color: colors.destructive, fontFamily: P.semibold }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.versionText, { color: colors.mutedForeground, fontFamily: P.regular }]}>Daftari v1.0.0 · Built for Kenyan Businesses</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingBottom: 24, position: "relative", overflow: "hidden" },
  heroCircle: { position: "absolute", width: 260, height: 260, borderRadius: 130, borderWidth: 36, top: -80, right: -60 },
  heroInner: { flexDirection: "row", alignItems: "center", gap: 16, paddingTop: 8, paddingBottom: 20 },
  bigAvatar: { width: 68, height: 68, alignItems: "center", justifyContent: "center" },
  bigAvatarText: { fontSize: 22, color: "#0D1B3E" },
  heroInfo: { flex: 1, gap: 4 },
  heroName: { fontSize: 20, color: "#fff" },
  heroEmail: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start", marginTop: 4 },
  greenDot: { width: 6, height: 6, borderRadius: 3 },
  heroBadgeText: { fontSize: 11, color: "#34C78A" },
  statsStrip: { flexDirection: "row" },
  stripItem: { flex: 1, alignItems: "center", paddingVertical: 14, gap: 2 },
  stripValue: { fontSize: 18, color: "#fff" },
  stripLabel: { fontSize: 11, color: "rgba(255,255,255,0.55)" },
  body: { padding: 16, gap: 20 },
  section: { gap: 10 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionIconWrap: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 15 },
  formCard: { borderWidth: 1 },
  formInner: { padding: 16, gap: 14 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 11, letterSpacing: 0.8 },
  currencyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  currencyChip: { paddingHorizontal: 16, paddingVertical: 10 },
  currencyText: { fontSize: 13 },
  saveBtn: { height: 50, alignItems: "center", justifyContent: "center" },
  savedRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  saveBtnText: { color: "#fff", fontSize: 15 },
  accountRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  accountIconWrap: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  accountInfo: { flex: 1 },
  accountLabel: { fontSize: 11 },
  accountValue: { fontSize: 14, marginTop: 2 },
  signOutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderWidth: 1 },
  signOutText: { fontSize: 15 },
  versionText: { fontSize: 12, textAlign: "center", paddingTop: 4 },
});
