import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    setError("");
    const result = await resetPassword(email.trim().toLowerCase());
    setLoading(false);
    if (result.error) {
      setError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      setSent(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Link href="/auth/login" asChild>
          <TouchableOpacity style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </Link>

        <View
          style={[
            styles.iconWrap,
            { backgroundColor: colors.secondary, borderRadius: 100 },
          ]}
        >
          <Feather name="lock" size={30} color={colors.primary} />
        </View>

        <Text
          style={[
            styles.title,
            { color: colors.foreground, fontFamily: "Poppins_700Bold" },
          ]}
        >
          Reset your password
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" },
          ]}
        >
          Enter your email and we'll send you a reset link
        </Text>

        {sent ? (
          <View
            style={[
              styles.successBox,
              { backgroundColor: "#E8F5E9", borderRadius: colors.radius },
            ]}
          >
            <Feather name="check-circle" size={18} color={colors.success} />
            <Text
              style={[
                styles.successText,
                { color: colors.success, fontFamily: "Poppins_500Medium" },
              ]}
            >
              Reset link sent! Check your email inbox.
            </Text>
          </View>
        ) : null}

        {error ? (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: "#FFEBEE",
                borderRadius: colors.radius,
                borderColor: colors.destructive,
              },
            ]}
          >
            <Text
              style={[
                styles.errorText,
                { color: colors.destructive, fontFamily: "Poppins_400Regular" },
              ]}
            >
              {error}
            </Text>
          </View>
        ) : null}

        <Input
          label="Email address"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleReset}
          leftIcon={
            <Feather name="mail" size={18} color={colors.mutedForeground} />
          }
        />

        <Button
          label={sent ? "Resend Link" : "Send Reset Link"}
          onPress={handleReset}
          loading={loading}
          fullWidth
          size="lg"
        />

        <Link href="/auth/login" asChild>
          <TouchableOpacity style={styles.backLink}>
            <Text
              style={[
                styles.backLinkText,
                { color: colors.accent, fontFamily: "Poppins_500Medium" },
              ]}
            >
              Back to sign in
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, gap: 20 },
  backBtn: { padding: 4, marginBottom: 8 },
  iconWrap: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  title: { fontSize: 24, textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
  },
  successText: { fontSize: 13, flex: 1 },
  errorBox: { padding: 12, borderWidth: 1 },
  errorText: { fontSize: 13 },
  backLink: { alignSelf: "center" },
  backLinkText: { fontSize: 14 },
});
