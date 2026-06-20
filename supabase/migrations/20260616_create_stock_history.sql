CREATE TABLE IF NOT EXISTS stock_history (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('sale', 'purchase', 'transfer_in', 'transfer_out', 'return', 'adjustment')),
  quantity integer NOT NULL,
  stock_before integer NOT NULL,
  stock_after integer NOT NULL,
  reference text NOT NULL,
  note text,
  warehouse text NOT NULL,
  user_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to stock_history"
  ON stock_history
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_stock_history_product_id
  ON stock_history(product_id);

CREATE INDEX IF NOT EXISTS idx_stock_history_created_at
  ON stock_history(created_at DESC);
