import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";

export default function AddCreditScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const { business } = useAuth();
  const { getCustomerById, addTransaction } = useData();
  const currency = business?.currency ?? "KES";
  const customer = getCustomerById(customerId);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const today = new Date().toISOString().split("T")[0];
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      e.amount = "Enter a valid amount";
    if (!description.trim()) e.description = "Description is required";
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))
      e.date = "Use format YYYY-MM-DD";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    const result = await addTransaction({
      customer_id: customerId,
      amount: Number(amount),
      type: "credit",
      description: description.trim(),
      transaction_date: date,
    });
    setLoading(false);
    if (result.error) {
      Alert.alert("Error", result.error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }
  };

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
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text
          style={[
            styles.navTitle,
            { color: colors.foreground, fontFamily: "Poppins_700Bold" },
          ]}
        >
          Add Credit
        </Text>
        <View style={{ width: 30 }} />
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        {customer && (
          <Card
            style={[
              styles.customerBanner,
              { backgroundColor: colors.secondary },
            ]}
          >
            <Feather name="user" size={16} color={colors.mutedForeground} />
            <View>
              <Text
                style={[
                  styles.bannerName,
                  { color: colors.foreground, fontFamily: "Poppins_600SemiBold" },
                ]}
              >
                {customer.name}
              </Text>
              <Text
                style={[
                  styles.bannerBalance,
                  { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" },
                ]}
              >
                Current balance: {currency}{" "}
                {customer.balance.toLocaleString()}
              </Text>
            </View>
          </Card>
        )}

        <View
          style={[
            styles.typeIndicator,
            { backgroundColor: "#FFEBEE", borderRadius: colors.radius },
          ]}
        >
          <Feather name="arrow-up-right" size={18} color={colors.destructive} />
          <Text
            style={[
              styles.typeText,
              { color: colors.destructive, fontFamily: "Poppins_600SemiBold" },
            ]}
          >
            Recording a DEBT (customer owes you)
          </Text>
        </View>

        <Input
          label={`Amount (${currency}) *`}
          placeholder="0"
          value={amount}
          onChangeText={(t) => {
            setAmount(t);
            if (errors.amount) setErrors((e) => ({ ...e, amount: "" }));
          }}
          error={errors.amount}
          keyboardType="numeric"
          returnKeyType="next"
          leftIcon={<Feather name="dollar-sign" size={18} color={colors.mutedForeground} />}
        />
        <Input
          label="Description *"
          placeholder="e.g. Bread, Sugar, Cooking oil"
          value={description}
          onChangeText={(t) => {
            setDescription(t);
            if (errors.description) setErrors((e) => ({ ...e, description: "" }));
          }}
          error={errors.description}
          autoCapitalize="sentences"
          returnKeyType="next"
          leftIcon={<Feather name="tag" size={18} color={colors.mutedForeground} />}
        />
        <Input
          label="Date"
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={(t) => {
            setDate(t);
            if (errors.date) setErrors((e) => ({ ...e, date: "" }));
          }}
          error={errors.date}
          leftIcon={<Feather name="calendar" size={18} color={colors.mutedForeground} />}
        />

        <Button
          label="Add Credit"
          onPress={handleSave}
          loading={loading}
          fullWidth
          size="lg"
          style={{ marginTop: 8 }}
        />
      </KeyboardAwareScrollViewCompat>
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
  navTitle: { flex: 1, fontSize: 17, textAlign: "center" },
  content: { padding: 16, gap: 14 },
  customerBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
    borderWidth: 0,
  },
  bannerName: { fontSize: 14 },
  bannerBalance: { fontSize: 13 },
  typeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
  },
  typeText: { fontSize: 13 },
});
