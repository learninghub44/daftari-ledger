const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? "";
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const MODEL = "llama-3.1-8b-instant";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatWithGroq(messages: GroqMessage[]): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured. Add GROQ_API_KEY to your secrets.");
  }
  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export function generateReminderPrompt(
  customerName: string,
  balance: number,
  currency: string,
  tone: "friendly" | "firm" | "urgent"
): string {
  const toneMap = {
    friendly:
      "Write a warm, polite, and friendly payment reminder message. Be understanding but clear.",
    firm: "Write a professional and firm payment reminder. Be respectful but assertive.",
    urgent:
      "Write an urgent payment reminder. Be clear that immediate action is required. Keep professional.",
  };

  return `${toneMap[tone]}

Customer name: ${customerName}
Outstanding balance: ${currency} ${balance.toLocaleString()}

Write ONLY the message text (no greetings like "Sure, here is..."), starting with "Hello ${customerName}". Keep it under 100 words. Include the exact amount.`;
}

export function generateInsightsPrompt(stats: {
  totalCustomers: number;
  totalOutstanding: number;
  overdueAmount: number;
  topDebtors: Array<{ name: string; balance: number }>;
  currency: string;
  collectionsThisMonth: number;
}): string {
  return `You are a business intelligence assistant for a small business in Kenya using a digital credit book app called Daftari.

Business stats:
- Total customers: ${stats.totalCustomers}
- Total outstanding debt: ${stats.currency} ${stats.totalOutstanding.toLocaleString()}
- Overdue amount: ${stats.currency} ${stats.overdueAmount.toLocaleString()}
- Collections this month: ${stats.currency} ${stats.collectionsThisMonth.toLocaleString()}
- Top debtors: ${stats.topDebtors.map((d) => `${d.name} (${stats.currency} ${d.balance.toLocaleString()})`).join(", ")}

Provide 3-4 concise, actionable business insights in bullet points. Focus on practical advice for improving cash flow and collections. Keep each bullet under 30 words. Be specific and data-driven.`;
}
