import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors, P } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    if (!businessName || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    const result = await signUp(email.trim().toLowerCase(), password, businessName.trim());
    setLoading(false);
    if (result.error) {
      setError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  if (success) {
    return (
      <View style={[styles.successRoot, { backgroundColor: colors.primary, paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.successInner}>
          <View style={[styles.successIconWrap, { backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 100 }]}>
            <Feather name="check" size={40} color={colors.accent} />
          </View>
          <Text style={[styles.successTitle, { fontFamily: P.bold }]}>You're all set!</Text>
          <Text style={[styles.successSub, { fontFamily: P.regular }]}>
            Check your email to verify your account, then sign in to start tracking credit.
          </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity style={[styles.successBtn, { backgroundColor: colors.accent, borderRadius: 100 }]}>
              <Text style={[styles.successBtnText, { fontFamily: P.semibold, color: colors.primary }]}>
                Go to Sign In
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.primary }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.hero, { paddingTop: insets.top + 20 }]}>
        <View style={[styles.circle1, { borderColor: "rgba(201,168,76,0.15)" }]} />
        <View style={[styles.backRow]}>
          <Link href="/auth/login" asChild>
            <TouchableOpacity style={[styles.backBtn, { backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 100 }]}>
              <Feather name="arrow-left" size={18} color="#fff" />
            </TouchableOpacity>
          </Link>
        </View>
        <Text style={[styles.heroTitle, { fontFamily: P.bold }]}>Create account</Text>
        <Text style={[styles.heroSub, { fontFamily: P.regular }]}>
          Set up your Daftari credit book
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius + 8, paddingBottom: insets.bottom + 28 }]}>
          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: "#FEE2E2", borderRadius: 10 }]}>
              <Feather name="alert-circle" size={13} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive, fontFamily: P.medium }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: P.medium }]}>Business Name</Text>
            <View style={[styles.inputBox, { borderColor: colors.border, backgroundColor: colors.muted }]}>
              <Feather name="briefcase" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.inputText, { color: colors.foreground, fontFamily: P.regular }]}
                placeholder="e.g. Kamau's General Store"
                placeholderTextColor={colors.mutedForeground}
                value={businessName}
                onChangeText={setBusinessName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: P.medium }]}>Email</Text>
            <View style={[styles.inputBox, { borderColor: colors.border, backgroundColor: colors.muted }]}>
              <Feather name="mail" size={16} color={colors.mutedForeground} />
              <TextInput
                ref={emailRef}
                style={[styles.inputText, { color: colors.foreground, fontFamily: P.regular }]}
                placeholder="you@example.com"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: P.medium }]}>Password</Text>
            <View style={[styles.inputBox, { borderColor: colors.border, backgroundColor: colors.muted }]}>
              <Feather name="lock" size={16} color={colors.mutedForeground} />
              <TextInput
                ref={passwordRef}
                style={[styles.inputText, { color: colors.foreground, fontFamily: P.regular }]}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Feather name={showPass ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
            style={[styles.signInBtn, { backgroundColor: loading ? colors.mutedForeground : colors.primary, borderRadius: 100 }]}
          >
            <Text style={[styles.signInText, { fontFamily: P.semibold }]}>
              {loading ? "Creating account…" : "Create Account"}
            </Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.mutedForeground, fontFamily: P.regular }]}>
              Already have an account?{" "}
            </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={[styles.footerLink, { color: colors.accent, fontFamily: P.semibold }]}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  successRoot: { flex: 1, alignItems: "center", justifyContent: "center" },
  successInner: { alignItems: "center", paddingHorizontal: 32, gap: 16 },
  successIconWrap: { width: 96, height: 96, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  successTitle: { fontSize: 28, color: "#fff", textAlign: "center" },
  successSub: { fontSize: 15, color: "rgba(255,255,255,0.65)", textAlign: "center", lineHeight: 22 },
  successBtn: { paddingVertical: 16, paddingHorizontal: 40, marginTop: 12 },
  successBtnText: { fontSize: 16 },
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    gap: 8,
    position: "relative",
    overflow: "hidden",
  },
  circle1: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 35,
    top: -60,
    right: -60,
  },
  backRow: { marginBottom: 20 },
  backBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  heroTitle: { fontSize: 28, color: "#fff" },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.6)" },
  scrollContent: { flexGrow: 1, justifyContent: "flex-end" },
  card: {
    paddingHorizontal: 28,
    paddingTop: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
    gap: 0,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, flex: 1 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  inputText: { flex: 1, fontSize: 15, height: "100%" },
  eyeBtn: { padding: 4 },
  signInBtn: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  signInText: { color: "#FFFFFF", fontSize: 16 },
  footerRow: { flexDirection: "row", justifyContent: "center" },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14 },
});
