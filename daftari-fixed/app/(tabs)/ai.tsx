import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors, P } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { GroqMessage, chatWithGroq, generateInsightsPrompt, generateReminderPrompt } from "@/lib/groq";

type Mode = "chat" | "insights" | "reminder";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "How do I collect from overdue customers?",
  "Tips to grow my business credit safely",
  "How to handle a customer who won't pay?",
];

export default function AIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { business } = useAuth();
  const { customers, dashboardStats } = useData();
  const currency = business?.currency ?? "KES";
  const [mode, setMode] = useState<Mode>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState("");
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [reminderTone, setReminderTone] = useState<"friendly" | "firm" | "urgent">("friendly");
  const [generatedReminder, setGeneratedReminder] = useState("");
  const [reminderLoading, setReminderLoading] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content };
    setMessages(prev => [userMsg, ...prev]);
    setInput("");
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const history: GroqMessage[] = [
      { role: "system", content: `You are a helpful business assistant for ${business?.name ?? "a business"} in Kenya. Help with debt collection strategies, customer relationships, and financial advice for small businesses. Currency: ${currency}. Be concise and practical.` },
      ...messages.slice().reverse().map(m => ({ role: m.role, content: m.content })),
      { role: "user", content },
    ];

    try {
      const reply = await chatWithGroq(history);
      setMessages(prev => [{ id: (Date.now() + 1).toString(), role: "assistant", content: reply }, ...prev]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      Alert.alert("Error", `Could not reach the AI.\n\n${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    setInsightsLoading(true);
    setInsights("");
    const topDebtors = [...customers].filter(c => c.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 5).map(c => ({ name: c.name, balance: c.balance }));
    const prompt = generateInsightsPrompt({ totalCustomers: dashboardStats.total_customers, totalOutstanding: dashboardStats.total_outstanding, overdueAmount: dashboardStats.overdue_amount, topDebtors, currency, collectionsThisMonth: dashboardStats.todays_collections });
    try {
      const reply = await chatWithGroq([{ role: "user", content: prompt }]);
      setInsights(reply);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      Alert.alert("Error", `Could not generate insights.\n\n${msg}`);
    } finally {
      setInsightsLoading(false);
    }
  };

  const generateReminder = async () => {
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) { Alert.alert("Select a customer first"); return; }
    setReminderLoading(true);
    setGeneratedReminder("");
    try {
      const reply = await chatWithGroq([{ role: "user", content: generateReminderPrompt(customer.name, customer.balance, currency, reminderTone) }]);
      setGeneratedReminder(reply);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      Alert.alert("Error", `Could not generate reminder.\n\n${msg}`);
    } finally {
      setReminderLoading(false);
    }
  };

  const debtors = customers.filter(c => c.balance > 0);
  const modes: { key: Mode; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { key: "chat", label: "Chat", icon: "message-circle" },
    { key: "insights", label: "Insights", icon: "bar-chart-2" },
    { key: "reminder", label: "Reminder", icon: "send" },
  ];

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior="padding" keyboardVerticalOffset={0}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 10, backgroundColor: colors.background }]}>
        <View style={styles.titleRow}>
          <View style={[styles.aiIcon, { backgroundColor: colors.primary, borderRadius: 14 }]}>
            <Feather name="zap" size={16} color={colors.accent} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.foreground, fontFamily: P.bold }]}>AI Assistant</Text>
            <Text style={[styles.titleSub, { color: colors.mutedForeground, fontFamily: P.regular }]}>Powered by Groq · llama-3.1</Text>
          </View>
        </View>
        <View style={[styles.modeBar, { backgroundColor: colors.muted, borderRadius: 100, padding: 3 }]}>
          {modes.map(m => (
            <TouchableOpacity key={m.key} onPress={() => setMode(m.key)}
              style={[styles.modeBtn, mode === m.key && { backgroundColor: colors.primary, borderRadius: 100 }, { borderRadius: 100 }]}>
              <Feather name={m.icon} size={13} color={mode === m.key ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.modeBtnText, { color: mode === m.key ? "#fff" : colors.mutedForeground, fontFamily: P.medium }]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* CHAT MODE */}
      {mode === "chat" && (
        <>
          <FlatList<ChatMessage>
            ref={flatRef}
            data={messages}
            keyExtractor={item => item.id}
            inverted
            contentContainerStyle={[styles.chatList, { paddingBottom: 8 }]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.chatEmpty}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.muted, borderRadius: 100 }]}>
                  <Feather name="zap" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: P.semibold }]}>Ask your AI assistant</Text>
                <Text style={[styles.emptySubtitle, { color: colors.mutedForeground, fontFamily: P.regular }]}>
                  Get advice on collections, customer management, and business growth
                </Text>
                <View style={styles.quickPrompts}>
                  {QUICK_PROMPTS.map(q => (
                    <TouchableOpacity key={q} onPress={() => sendMessage(q)}
                      style={[styles.quickChip, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 100 }]}>
                      <Text style={[styles.quickChipText, { color: colors.foreground, fontFamily: P.regular }]}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <View style={[styles.messageRow, item.role === "user" ? styles.userRow : styles.aiRow]}>
                {item.role === "assistant" && (
                  <View style={[styles.aiAvatar, { backgroundColor: colors.primary, borderRadius: 12 }]}>
                    <Feather name="zap" size={12} color={colors.accent} />
                  </View>
                )}
                <View style={[styles.bubble,
                  item.role === "user"
                    ? { backgroundColor: colors.primary, borderRadius: 18, borderBottomRightRadius: 4 }
                    : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 18, borderBottomLeftRadius: 4 }
                ]}>
                  <Text style={[styles.bubbleText, { color: item.role === "user" ? "#fff" : colors.foreground, fontFamily: P.regular }]}>
                    {item.content}
                  </Text>
                </View>
              </View>
            )}
          />

          {loading && (
            <View style={[styles.typingRow, { paddingHorizontal: 16 }]}>
              <View style={[styles.aiAvatar, { backgroundColor: colors.primary, borderRadius: 12 }]}>
                <Feather name="zap" size={12} color={colors.accent} />
              </View>
              <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 18, borderBottomLeftRadius: 4 }]}>
                <ActivityIndicator size="small" color={colors.mutedForeground} />
                <Text style={[styles.typingText, { color: colors.mutedForeground, fontFamily: P.regular }]}>Thinking…</Text>
              </View>
            </View>
          )}

          <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 10 }]}>
            <TextInput
              style={[styles.chatInput, { backgroundColor: colors.muted, borderRadius: 22, color: colors.foreground, fontFamily: P.regular }]}
              placeholder="Ask about your business…"
              placeholderTextColor={colors.mutedForeground}
              value={input}
              onChangeText={setInput}
              multiline
              returnKeyType="send"
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity onPress={() => sendMessage()} disabled={!input.trim() || loading} activeOpacity={0.8}
              style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted, borderRadius: 100, opacity: !input.trim() || loading ? 0.6 : 1 }]}>
              <Feather name="send" size={16} color={input.trim() ? "#fff" : colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* INSIGHTS MODE */}
      {mode === "insights" && (
        <ScrollView contentContainerStyle={[styles.scrollPad, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.insightHero, { backgroundColor: colors.primary, borderRadius: colors.radius + 4 }]}>
            <View style={[styles.insightHeroIcon, { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14 }]}>
              <Feather name="bar-chart-2" size={22} color={colors.accent} />
            </View>
            <Text style={[styles.insightHeroTitle, { fontFamily: P.bold }]}>Business Intelligence</Text>
            <Text style={[styles.insightHeroSub, { fontFamily: P.regular }]}>
              AI-powered analysis of your customers, debts, and collection patterns.
            </Text>
            <TouchableOpacity onPress={generateInsights} disabled={insightsLoading} activeOpacity={0.85}
              style={[styles.genBtn, { backgroundColor: colors.accent, borderRadius: 100, opacity: insightsLoading ? 0.7 : 1 }]}>
              {insightsLoading
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <><Feather name="zap" size={16} color={colors.primary} /><Text style={[styles.genBtnText, { color: colors.primary, fontFamily: P.semibold }]}>Generate Insights</Text></>
              }
            </TouchableOpacity>
          </View>

          {insights ? (
            <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <View style={styles.resultCardHeader}>
                <Feather name="check-circle" size={16} color={colors.success} />
                <Text style={[styles.resultCardTitle, { color: colors.foreground, fontFamily: P.semibold }]}>Analysis Complete</Text>
              </View>
              <Text style={[styles.resultText, { color: colors.foreground, fontFamily: P.regular }]}>{insights}</Text>
            </View>
          ) : null}
        </ScrollView>
      )}

      {/* REMINDER MODE */}
      {mode === "reminder" && (
        <ScrollView contentContainerStyle={[styles.scrollPad, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.reminderCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: P.semibold }]}>Select Customer</Text>
            {debtors.length === 0
              ? <Text style={[styles.emptyNote, { color: colors.mutedForeground, fontFamily: P.regular }]}>No customers with outstanding balance</Text>
              : <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  <View style={styles.chipRow}>
                    {debtors.map(c => (
                      <TouchableOpacity key={c.id} onPress={() => setSelectedCustomerId(c.id)} activeOpacity={0.75}
                        style={[styles.customerChip, { backgroundColor: selectedCustomerId === c.id ? colors.primary : colors.muted, borderRadius: 10 }]}>
                        <Text style={[styles.customerChipText, { color: selectedCustomerId === c.id ? "#fff" : colors.foreground, fontFamily: P.medium }]}>{c.name}</Text>
                        <Text style={[styles.customerChipBal, { color: selectedCustomerId === c.id ? "rgba(255,255,255,0.7)" : colors.mutedForeground, fontFamily: P.regular }]}>{currency} {c.balance.toLocaleString()}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
            }

            <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: P.semibold, marginTop: 16 }]}>Message Tone</Text>
            <View style={styles.toneRow}>
              {([
                { key: "friendly", icon: "smile" as const, color: colors.success },
                { key: "firm", icon: "alert-circle" as const, color: colors.warning },
                { key: "urgent", icon: "alert-triangle" as const, color: colors.destructive },
              ] as const).map(t => (
                <TouchableOpacity key={t.key} onPress={() => setReminderTone(t.key)} activeOpacity={0.8}
                  style={[styles.toneChip, { backgroundColor: reminderTone === t.key ? t.color : colors.muted, borderRadius: 12, flex: 1 }]}>
                  <Feather name={t.icon} size={14} color={reminderTone === t.key ? "#fff" : colors.mutedForeground} />
                  <Text style={[styles.toneChipText, { color: reminderTone === t.key ? "#fff" : colors.mutedForeground, fontFamily: P.medium }]}>
                    {t.key.charAt(0).toUpperCase() + t.key.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={generateReminder} disabled={reminderLoading || !selectedCustomerId} activeOpacity={0.85}
              style={[styles.genBtn, { backgroundColor: colors.primary, borderRadius: 100, marginTop: 16, opacity: (!selectedCustomerId || reminderLoading) ? 0.5 : 1 }]}>
              {reminderLoading
                ? <ActivityIndicator size="small" color="#fff" />
                : <><Feather name="send" size={16} color="#fff" /><Text style={[styles.genBtnText, { color: "#fff", fontFamily: P.semibold }]}>Generate Message</Text></>
              }
            </TouchableOpacity>
          </View>

          {generatedReminder ? (
            <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <View style={styles.resultCardHeader}>
                <Feather name="message-square" size={16} color={colors.primary} />
                <Text style={[styles.resultCardTitle, { color: colors.foreground, fontFamily: P.semibold }]}>Generated Message</Text>
              </View>
              <Text style={[styles.resultText, { color: colors.foreground, fontFamily: P.regular }]}>{generatedReminder}</Text>
              <TouchableOpacity onPress={async () => { await Clipboard.setStringAsync(generatedReminder); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); Alert.alert("Copied!", "Message ready to paste into WhatsApp."); }} activeOpacity={0.8}
                style={[styles.copyBtn, { backgroundColor: colors.primary, borderRadius: 100 }]}>
                <Feather name="copy" size={15} color="#fff" />
                <Text style={[styles.copyBtnText, { fontFamily: P.semibold }]}>Copy for WhatsApp</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, gap: 14, paddingBottom: 12 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  aiIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20 },
  titleSub: { fontSize: 11, marginTop: 1 },
  modeBar: { flexDirection: "row", gap: 0 },
  modeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8 },
  modeBtnText: { fontSize: 13 },
  chatList: { paddingHorizontal: 16, paddingTop: 12, flexGrow: 1 },
  chatEmpty: { flex: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 40, gap: 12 },
  emptyIcon: { width: 64, height: 64, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 17, textAlign: "center" },
  emptySubtitle: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  quickPrompts: { gap: 8, width: "100%", marginTop: 8 },
  quickChip: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  quickChipText: { fontSize: 13, lineHeight: 18 },
  messageRow: { marginBottom: 10, maxWidth: "82%", gap: 8 },
  userRow: { alignSelf: "flex-end", flexDirection: "row" },
  aiRow: { alignSelf: "flex-start", flexDirection: "row", alignItems: "flex-end", gap: 8 },
  aiAvatar: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  bubble: { padding: 12, maxWidth: "100%" },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  typingRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingBottom: 8 },
  typingBubble: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderWidth: 1 },
  typingText: { fontSize: 13 },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 10, padding: 12, paddingTop: 10, borderTopWidth: 1 },
  chatInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  scrollPad: { padding: 16, gap: 14 },
  insightHero: { padding: 20, gap: 10, alignItems: "center" },
  insightHeroIcon: { width: 56, height: 56, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  insightHeroTitle: { fontSize: 20, color: "#fff", textAlign: "center" },
  insightHeroSub: { fontSize: 13, color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 19 },
  genBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 14, marginTop: 4 },
  genBtnText: { fontSize: 15 },
  resultCard: { borderWidth: 1, padding: 16, gap: 12 },
  resultCardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  resultCardTitle: { fontSize: 14 },
  resultText: { fontSize: 14, lineHeight: 22 },
  reminderCard: { borderWidth: 1, padding: 16, gap: 10 },
  sectionLabel: { fontSize: 14 },
  emptyNote: { fontSize: 13, textAlign: "center", paddingVertical: 12 },
  chipScroll: {},
  chipRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  customerChip: { paddingHorizontal: 14, paddingVertical: 10, gap: 2 },
  customerChipText: { fontSize: 13 },
  customerChipBal: { fontSize: 11 },
  toneRow: { flexDirection: "row", gap: 8 },
  toneChip: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11 },
  toneChipText: { fontSize: 13 },
  copyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13 },
  copyBtnText: { color: "#fff", fontSize: 14 },
});
