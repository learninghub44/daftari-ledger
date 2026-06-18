import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Dimensions,
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

const { height: SCREEN_H } = Dimensions.get("window");

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    const result = await signIn(email.trim().toLowerCase(), password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.primary }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* ── Hero top ── */}
      <View style={[styles.hero, { paddingTop: insets.top + 36 }]}>
        {/* decorative circles */}
        <View style={[styles.circle1, { borderColor: "rgba(201,168,76,0.18)" }]} />
        <View style={[styles.circle2, { borderColor: "rgba(201,168,76,0.1)" }]} />

        <View style={[styles.logoWrap, { backgroundColor: colors.accent }]}>
          <Feather name="book-open" size={26} color="#0D1B3E" />
        </View>
        <Text style={[styles.appName, { fontFamily: P.bold }]}>Daftari</Text>
        <Text style={[styles.tagline, { fontFamily: P.regular }]}>
          Smart credit tracking for your business
        </Text>
      </View>

      {/* ── Form card ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderRadius: colors.radius + 8,
              paddingBottom: insets.bottom + 28,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: P.bold }]}>
            Welcome back
          </Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground, fontFamily: P.regular }]}>
            Sign in to your account
          </Text>

          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: "#FEE2E2", borderRadius: 10 }]}>
              <Feather name="alert-circle" size={13} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive, fontFamily: P.medium }]}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* Email */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: P.medium }]}>
              Email
            </Text>
            <View style={[styles.inputBox, { borderColor: colors.border, backgroundColor: colors.muted }]}>
              <Feather name="mail" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
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

          {/* Password */}
          <View style={styles.fieldWrap}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: P.medium }]}>
                Password
              </Text>
              <Link href="/auth/forgot-password" asChild>
                <TouchableOpacity>
                  <Text style={[styles.forgotText, { color: colors.accent, fontFamily: P.medium }]}>
                    Forgot?
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
            <View style={[styles.inputBox, { borderColor: colors.border, backgroundColor: colors.muted }]}>
              <Feather name="lock" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={[styles.inputText, { color: colors.foreground, fontFamily: P.regular }]}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Feather name={showPass ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign in button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
            style={[
              styles.signInBtn,
              { backgroundColor: loading ? colors.mutedForeground : colors.primary, borderRadius: 100 },
            ]}
          >
            {loading ? (
              <Text style={[styles.signInText, { fontFamily: P.semibold }]}>Signing in…</Text>
            ) : (
              <Text style={[styles.signInText, { fontFamily: P.semibold }]}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.mutedForeground, fontFamily: P.regular }]}>
              No account yet?{" "}
            </Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity>
                <Text style={[styles.footerLink, { color: colors.accent, fontFamily: P.semibold }]}>
                  Create one
                </Text>
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
  hero: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 8,
    position: "relative",
    overflow: "hidden",
  },
  circle1: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 40,
    top: -80,
    right: -80,
  },
  circle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 30,
    bottom: -40,
    left: -40,
  },
  logoWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  appName: {
    fontSize: 34,
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  card: {
    paddingHorizontal: 28,
    paddingTop: 32,
    gap: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 24,
    color: "#0D1B3E",
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    marginBottom: 24,
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
  label: { fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  forgotText: { fontSize: 12 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  inputIcon: {},
  inputText: { flex: 1, fontSize: 15, height: "100%" },
  eyeBtn: { padding: 4 },
  signInBtn: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  signInText: { color: "#FFFFFF", fontSize: 16 },
  footerRow: { flexDirection: "row", justifyContent: "center" },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14 },
});
