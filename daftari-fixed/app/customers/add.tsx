import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
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
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useColors } from "@/hooks/useColors";
import { useData } from "@/context/DataContext";

export default function AddCustomerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addCustomer } = useData();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (phone && !/^[\d\s+\-()]{7,15}$/.test(phone))
      e.phone = "Enter a valid phone number";
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
    const result = await addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      location: location.trim(),
      notes: notes.trim(),
    });
    setLoading(false);
    if (result.error) {
      Alert.alert("Error", result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
          Add Customer
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
          placeholder="e.g. John Kamau"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (errors.name) setErrors((e) => ({ ...e, name: "" }));
          }}
          error={errors.name}
          autoCapitalize="words"
          returnKeyType="next"
          leftIcon={<Feather name="user" size={18} color={colors.mutedForeground} />}
        />
        <Input
          label="Phone Number"
          placeholder="+254 700 000 000"
          value={phone}
          onChangeText={(t) => {
            setPhone(t);
            if (errors.phone) setErrors((e) => ({ ...e, phone: "" }));
          }}
          error={errors.phone}
          keyboardType="phone-pad"
          returnKeyType="next"
          leftIcon={<Feather name="phone" size={18} color={colors.mutedForeground} />}
        />
        <Input
          label="Location (optional)"
          placeholder="e.g. Westlands, Nairobi"
          value={location}
          onChangeText={setLocation}
          autoCapitalize="words"
          returnKeyType="next"
          leftIcon={<Feather name="map-pin" size={18} color={colors.mutedForeground} />}
        />
        <Input
          label="Notes (optional)"
          placeholder="Any notes about this customer..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={{ height: 80, paddingTop: 12 }}
          leftIcon={<Feather name="file-text" size={18} color={colors.mutedForeground} />}
        />

        <Button
          label="Save Customer"
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
