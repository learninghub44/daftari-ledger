import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

export interface Customer {
  id: string;
  business_id: string;
  owner_id: string;
  name: string;
  phone: string;
  location?: string;
  notes?: string;
  created_at: string;
  balance?: number;
}

export interface Transaction {
  id: string;
  customer_id: string;
  business_id: string;
  amount: number;
  type: "credit" | "payment";
  description: string;
  transaction_date: string;
  created_at: string;
  running_balance?: number;
}

export type DebtStatus = "current" | "due_soon" | "overdue";

export interface CustomerWithBalance extends Customer {
  balance: number;
  last_transaction?: string;
  debt_status: DebtStatus;
}

export interface DashboardStats {
  total_customers: number;
  total_outstanding: number;
  todays_collections: number;
  total_payments: number;
  active_debtors: number;
  overdue_amount: number;
}

interface DataContextType {
  customers: CustomerWithBalance[];
  transactions: Transaction[];
  dashboardStats: DashboardStats;
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  addCustomer: (
    data: Omit<Customer, "id" | "business_id" | "owner_id" | "created_at" | "balance">
  ) => Promise<{ error: string | null; customer?: Customer }>;
  updateCustomer: (
    id: string,
    data: Partial<Customer>
  ) => Promise<{ error: string | null }>;
  deleteCustomer: (id: string) => Promise<{ error: string | null }>;
  addTransaction: (data: {
    customer_id: string;
    amount: number;
    type: "credit" | "payment";
    description: string;
    transaction_date: string;
  }) => Promise<{ error: string | null }>;
  getCustomerTransactions: (customerId: string) => Transaction[];
  getCustomerById: (id: string) => CustomerWithBalance | undefined;
}

const DataContext = createContext<DataContextType | null>(null);

const CUSTOMERS_KEY = "@daftari_customers";
const TRANSACTIONS_KEY = "@daftari_transactions";

function computeDebtStatus(lastTxDate?: string): DebtStatus {
  if (!lastTxDate) return "current";
  const daysDiff =
    (Date.now() - new Date(lastTxDate).getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff > 30) return "overdue";
  if (daysDiff > 21) return "due_soon";
  return "current";
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, business } = useAuth();
  const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const computeStats = useCallback(
    (
      custs: CustomerWithBalance[],
      txns: Transaction[]
    ): DashboardStats => {
      const today = new Date().toISOString().split("T")[0];
      const todaysPayments = txns
        .filter(
          (t) =>
            t.type === "payment" &&
            t.transaction_date.startsWith(today)
        )
        .reduce((s, t) => s + t.amount, 0);
      const totalPayments = txns
        .filter((t) => t.type === "payment")
        .reduce((s, t) => s + t.amount, 0);
      const totalOutstanding = custs
        .filter((c) => c.balance > 0)
        .reduce((s, c) => s + c.balance, 0);
      const overdueAmount = custs
        .filter((c) => c.balance > 0 && c.debt_status === "overdue")
        .reduce((s, c) => s + c.balance, 0);

      return {
        total_customers: custs.length,
        total_outstanding: totalOutstanding,
        todays_collections: todaysPayments,
        total_payments: totalPayments,
        active_debtors: custs.filter((c) => c.balance > 0).length,
        overdue_amount: overdueAmount,
      };
    },
    []
  );

  const enrichCustomers = useCallback(
    (
      rawCustomers: Customer[],
      rawTransactions: Transaction[]
    ): CustomerWithBalance[] => {
      return rawCustomers.map((c) => {
        const custTxns = rawTransactions
          .filter((t) => t.customer_id === c.id)
          .sort(
            (a, b) =>
              new Date(a.transaction_date).getTime() -
              new Date(b.transaction_date).getTime()
          );
        const balance = custTxns.reduce((sum, t) => {
          return t.type === "credit" ? sum + t.amount : sum - t.amount;
        }, 0);
        const lastTx =
          custTxns.length > 0
            ? custTxns[custTxns.length - 1].transaction_date
            : undefined;
        return {
          ...c,
          balance: Math.max(0, balance),
          last_transaction: lastTx,
          debt_status: balance > 0 ? computeDebtStatus(lastTx) : "current",
        };
      });
    },
    []
  );

  const loadFromCache = useCallback(async () => {
    const [cachedCustomers, cachedTransactions] = await Promise.all([
      AsyncStorage.getItem(CUSTOMERS_KEY),
      AsyncStorage.getItem(TRANSACTIONS_KEY),
    ]);
    if (cachedCustomers && cachedTransactions) {
      const rawC: Customer[] = JSON.parse(cachedCustomers);
      const rawT: Transaction[] = JSON.parse(cachedTransactions);
      const enriched = enrichCustomers(rawC, rawT);
      setCustomers(enriched);
      setTransactions(rawT);
    }
  }, [enrichCustomers]);

  const fetchFromSupabase = useCallback(async () => {
    if (!user || !business) return;

    const [{ data: custData }, { data: txnData }] = await Promise.all([
      supabase
        .from("customers")
        .select("*")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("transactions")
        .select("*")
        .eq("business_id", business.id)
        .order("transaction_date", { ascending: true }),
    ]);

    const rawC: Customer[] = custData ?? [];
    const rawT: Transaction[] = txnData ?? [];
    const enriched = enrichCustomers(rawC, rawT);

    setCustomers(enriched);
    setTransactions(rawT);

    await Promise.all([
      AsyncStorage.setItem(CUSTOMERS_KEY, JSON.stringify(rawC)),
      AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(rawT)),
    ]);
  }, [user, business, enrichCustomers]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFromSupabase();
    setRefreshing(false);
  }, [fetchFromSupabase]);

  useEffect(() => {
    if (!user || !business) {
      setLoading(false);
      return;
    }
    loadFromCache().then(() => {
      fetchFromSupabase().finally(() => setLoading(false));
    });
  }, [user, business, loadFromCache, fetchFromSupabase]);

  const addCustomer = useCallback(
    async (
      data: Omit<Customer, "id" | "business_id" | "owner_id" | "created_at" | "balance">
    ): Promise<{ error: string | null; customer?: Customer }> => {
      if (!business) return { error: "No business profile" };
      const { data: newCustomer, error } = await supabase
        .from("customers")
        .insert({ ...data, business_id: business.id, owner_id: user!.id })
        .select()
        .single();
      if (error) return { error: error.message };
      await fetchFromSupabase();
      return { error: null, customer: newCustomer };
    },
    [business, fetchFromSupabase]
  );

  const updateCustomer = useCallback(
    async (
      id: string,
      data: Partial<Customer>
    ): Promise<{ error: string | null }> => {
      const { error } = await supabase
        .from("customers")
        .update(data)
        .eq("id", id);
      if (error) return { error: error.message };
      await fetchFromSupabase();
      return { error: null };
    },
    [fetchFromSupabase]
  );

  const deleteCustomer = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      const { error: txError } = await supabase.from("transactions").delete().eq("customer_id", id);
      if (txError) return { error: txError.message };
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id);
      if (error) return { error: error.message };
      await fetchFromSupabase();
      return { error: null };
    },
    [fetchFromSupabase]
  );

  const addTransaction = useCallback(
    async (data: {
      customer_id: string;
      amount: number;
      type: "credit" | "payment";
      description: string;
      transaction_date: string;
    }): Promise<{ error: string | null }> => {
      if (!business) return { error: "No business profile" };
      const { error } = await supabase.from("transactions").insert({
        ...data,
        business_id: business.id,
        owner_id: user!.id,
      });
      if (error) return { error: error.message };
      await fetchFromSupabase();
      return { error: null };
    },
    [business, fetchFromSupabase]
  );

  const getCustomerTransactions = useCallback(
    (customerId: string): Transaction[] => {
      return transactions
        .filter((t) => t.customer_id === customerId)
        .sort(
          (a, b) =>
            new Date(b.transaction_date).getTime() -
            new Date(a.transaction_date).getTime()
        );
    },
    [transactions]
  );

  const getCustomerById = useCallback(
    (id: string): CustomerWithBalance | undefined => {
      return customers.find((c) => c.id === id);
    },
    [customers]
  );

  const dashboardStats = computeStats(customers, transactions);

  return (
    <DataContext.Provider
      value={{
        customers,
        transactions,
        dashboardStats,
        loading,
        refreshing,
        refresh,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addTransaction,
        getCustomerTransactions,
        getCustomerById,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
