import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session, User } from "@supabase/supabase-js";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface BusinessProfile {
  id: string;
  owner_id: string;
  name: string;
  phone: string;
  location: string;
  currency: string;
  logo_url?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  business: BusinessProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, businessName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateBusiness: (updates: Partial<BusinessProfile>) => Promise<{ error: string | null }>;
  refreshBusiness: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const BUSINESS_STORAGE_KEY = "@daftari_business";

function SetupScreen() {
  return (
    <View style={styles.setup}>
      <Text style={styles.setupIcon}>🔑</Text>
      <Text style={styles.setupTitle}>Setup Required</Text>
      <Text style={styles.setupText}>Add these secrets to your Replit Secrets panel:</Text>
      <View style={styles.setupList}>
        {["SUPABASE_URL", "SUPABASE_ANON_KEY", "GROQ_API_KEY"].map((key) => (
          <Text key={key} style={styles.setupKey}>• {key}</Text>
        ))}
      </View>
      <Text style={styles.setupHint}>Then restart the Expo workflow.</Text>
    </View>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  const fetchBusiness = useCallback(async (userId: string) => {
    const cached = await AsyncStorage.getItem(BUSINESS_STORAGE_KEY);
    if (cached) setBusiness(JSON.parse(cached));
    const { data } = await supabase.from("businesses").select("*").eq("owner_id", userId).single();
    if (data) {
      setBusiness(data);
      await AsyncStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(data));
    }
  }, []);

  const refreshBusiness = useCallback(async () => {
    if (user) await fetchBusiness(user.id);
  }, [user, fetchBusiness]);

  useEffect(() => {
    if (!configured) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchBusiness(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchBusiness(s.user.id);
      else { setBusiness(null); AsyncStorage.removeItem(BUSINESS_STORAGE_KEY); }
    });
    return () => subscription.unsubscribe();
  }, [fetchBusiness, configured]);

  const signUp = async (email: string, password: string, businessName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      const { error: bizError } = await supabase.from("businesses").insert({
        owner_id: data.user.id, name: businessName, phone: "", location: "", currency: "KES",
      });
      if (bizError) return { error: bizError.message };
      await fetchBusiness(data.user.id);
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(BUSINESS_STORAGE_KEY);
    setBusiness(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { error: error.message };
    return { error: null };
  };

  const updateBusiness = async (updates: Partial<BusinessProfile>) => {
    if (!user) return { error: "Not authenticated" };
    const { error } = await supabase.from("businesses").update(updates).eq("owner_id", user.id);
    if (error) return { error: error.message };
    await fetchBusiness(user.id);
    return { error: null };
  };

  if (!configured) return <SetupScreen />;

  return (
    <AuthContext.Provider value={{ user, session, business, loading, signUp, signIn, signOut, resetPassword, updateBusiness, refreshBusiness }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

const styles = StyleSheet.create({
  setup: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: "#0D1B3E", gap: 12 },
  setupIcon: { fontSize: 48 },
  setupTitle: { fontSize: 22, fontWeight: "700", color: "#fff", textAlign: "center" },
  setupText: { fontSize: 15, color: "rgba(255,255,255,0.7)", textAlign: "center" },
  setupList: { gap: 6 },
  setupKey: { fontSize: 14, color: "#C9A84C", fontFamily: "monospace", textAlign: "center" },
  setupHint: { fontSize: 13, color: "rgba(255,255,255,0.45)", textAlign: "center", marginTop: 8 },
});
