-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to categories"
  ON categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create join table for product-category relationship
CREATE TABLE IF NOT EXISTS product_categories (
  product_id text NOT NULL,
  category_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, category_id),
  CONSTRAINT product_categories_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT product_categories_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Helpful indexes
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to product_categories"
  ON product_categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_product_categories_category_id
  ON product_categories(category_id);
