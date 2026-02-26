
-- Create Airlines table
CREATE TABLE IF NOT EXISTS airlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE airlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Policies for Airlines
CREATE POLICY "Public read access for airlines" ON airlines
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access for airlines" ON airlines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policies for Brands
CREATE POLICY "Public read access for brands" ON brands
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access for brands" ON brands
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );


-- Rename brands table to currencies
ALTER TABLE brands RENAME TO currencies;

-- Create Regions table
CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for regions
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

-- Policies for Regions
CREATE POLICY "Public read access for regions" ON regions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access for regions" ON regions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default region values
INSERT INTO regions (code) VALUES
  ('GLOBAL'),
  ('EEA'),
  ('UK'),
  ('US')
ON CONFLICT (code) DO NOTHING;
