-- Extensions (safe to re-run)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
    CREATE TYPE account_type AS ENUM ('savings','current');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
    CREATE TYPE account_status AS ENUM ('active','closed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tx_type') THEN
    CREATE TYPE tx_type AS ENUM ('deposit','withdrawal','transfer');
  END IF;
END $$;

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE,
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Accounts
CREATE TABLE IF NOT EXISTS accounts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id       UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  account_number    VARCHAR(20) NOT NULL UNIQUE,
  type              account_type NOT NULL,
  status            account_status NOT NULL DEFAULT 'active',
  balance           NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type                    tx_type NOT NULL,
  account_id              UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  counterparty_account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
  amount                  NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  balance_before          NUMERIC(14,2) NOT NULL,
  balance_after           NUMERIC(14,2) NOT NULL,
  reference               TEXT NOT NULL UNIQUE,
  metadata                JSONB,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_accounts_customer ON accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_tx_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_tx_created_at ON transactions(created_at);
