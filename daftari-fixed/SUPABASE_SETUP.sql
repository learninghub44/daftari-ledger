-- ============================================================
-- DAFTARI — Complete Supabase Database Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── 1. ENABLE EXTENSIONS ───────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 2. BUSINESSES TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS businesses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL DEFAULT '',
  location    TEXT NOT NULL DEFAULT '',
  currency    TEXT NOT NULL DEFAULT 'KES',
  logo_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 3. CUSTOMERS TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id    UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  owner_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  phone          TEXT DEFAULT '',
  email          TEXT DEFAULT '',
  location       TEXT DEFAULT '',
  notes          TEXT DEFAULT '',
  credit_limit   NUMERIC(12,2) DEFAULT 0,
  due_date       DATE,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 4. TRANSACTIONS TABLE ──────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id      UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id      UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  owner_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type             TEXT NOT NULL CHECK (type IN ('credit', 'payment')),
  amount           NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  description      TEXT DEFAULT '',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 5. INDEXES FOR PERFORMANCE ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id   ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_owner_id    ON customers(owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_business ON transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_transactions_owner    ON transactions(owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date     ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type     ON transactions(type);

-- ─── 6. AUTO-UPDATE updated_at TRIGGER ──────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 7. ROW LEVEL SECURITY ───────────────────────────────────
ALTER TABLE businesses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Businesses: each user only sees/edits their own
CREATE POLICY "businesses_select" ON businesses
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "businesses_insert" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "businesses_update" ON businesses
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "businesses_delete" ON businesses
  FOR DELETE USING (auth.uid() = owner_id);

-- Customers: same owner-only pattern
CREATE POLICY "customers_select" ON customers
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "customers_insert" ON customers
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "customers_update" ON customers
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "customers_delete" ON customers
  FOR DELETE USING (auth.uid() = owner_id);

-- Transactions: same owner-only pattern
CREATE POLICY "transactions_select" ON transactions
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "transactions_insert" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "transactions_update" ON transactions
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "transactions_delete" ON transactions
  FOR DELETE USING (auth.uid() = owner_id);

-- ─── 8. CONFIRM SETUP (run this to verify tables exist) ─────
SELECT table_name, (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) AS columns
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('businesses', 'customers', 'transactions')
ORDER BY table_name;
