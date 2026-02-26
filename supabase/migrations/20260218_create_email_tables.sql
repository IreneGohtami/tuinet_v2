
-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  airline_id UUID REFERENCES settings_airlines(id) ON DELETE CASCADE,
  region_id UUID REFERENCES settings_regions(id) ON DELETE CASCADE,
  currency_id UUID REFERENCES settings_currencies(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variable_placeholders TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint for fallback logic (handling NULLs for defaults)
CREATE UNIQUE INDEX IF NOT EXISTS email_templates_type_airline_region_currency_idx
ON email_templates (type,
  (COALESCE(airline_id, '00000000-0000-0000-0000-000000000000')),
  (COALESCE(region_id, '00000000-0000-0000-0000-000000000000')),
  (COALESCE(currency_id, '00000000-0000-0000-0000-000000000000'))
);

-- Airline SMTP Settings Table
CREATE TABLE IF NOT EXISTS settings_airline_smtp (
  airline_id UUID PRIMARY KEY REFERENCES settings_airlines(id) ON DELETE CASCADE,
  auth_type TEXT NOT NULL CHECK (auth_type IN ('BASIC', 'OAUTH2')),
  host TEXT,
  port INTEGER,
  "user" TEXT NOT NULL,
  password TEXT, -- Encrypted
  client_id TEXT, -- Encrypted
  client_secret TEXT, -- Encrypted
  refresh_token TEXT, -- Encrypted
  tenant_id TEXT, -- Encrypted (Microsoft/Outlook)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Logs Table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  airline_id UUID REFERENCES settings_airlines(id) ON DELETE SET NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  attachments_sent JSONB DEFAULT '[]',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_airline_smtp ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin full access, Authenticated read for templates)
CREATE POLICY "Admin full access for email_templates" ON email_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated read access for email_templates" ON email_templates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access for settings_airline_smtp" ON settings_airline_smtp
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin full access for email_logs" ON email_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

ALTER TABLE settings_airline_smtp DROP COLUMN refresh_token;