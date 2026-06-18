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
import { EmptyState } from "@/components/EmptyState";
import { useColors } from "@/hooks/useColors";
import { useData } from "@/context/DataContext";

export default function EditCustomerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCustomerById, updateCustomer } = useData();
  const customer = getCustomerById(id);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [location, setLocation] = useState(customer?.location ?? "");
  const [notes, setNotes] = useState(customer?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!customer) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState icon="user-x" title="Customer not found" />
      </View>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setLoading(true);
    const result = await updateCustomer(id, {
      name: name.trim(),
      phone: phone.trim(),
      location: location.trim(),
      notes: notes.trim(),
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
          Edit Customer
        </Text>
        <View style={{ width: 30 }} />
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={24}
      >
        <Input
          label="Full Name *"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (errors.name) setErrors((e) => ({ ...e, name: "" }));
          }}
          error={errors.name}
          autoCapitalize="words"
          leftIcon={<Feather name="user" size={18} color={colors.mutedForeground} />}
        />
        <Input
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          leftIcon={<Feather name="phone" size={18} color={colors.mutedForeground} />}
        />
        <Input
          label="Location (optional)"
          value={location}
          onChangeText={setLocation}
          autoCapitalize="words"
          leftIcon={<Feather name="map-pin" size={18} color={colors.mutedForeground} />}
        />
        <Input
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={{ height: 80, paddingTop: 12 }}
          leftIcon={<Feather name="file-text" size={18} color={colors.mutedForeground} />}
        />

        <Button
          label="Save Changes"
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
});
