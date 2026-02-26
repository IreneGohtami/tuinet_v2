
-- Create Roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, module, action)
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- Policies for Roles (Admin only)
CREATE POLICY "Admin read access for roles" ON roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin full access for roles" ON roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policies for Permissions (Admin only)
CREATE POLICY "Admin read access for permissions" ON permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin full access for permissions" ON permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default roles
INSERT INTO roles (name, description, is_system) VALUES
  ('admin', 'Full system access', TRUE),
  ('user', 'Standard user access', TRUE),
  ('viewer', 'Read-only access', FALSE)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions for admin role
INSERT INTO permissions (role_id, module, action)
SELECT r.id, m.module, a.action
FROM roles r
CROSS JOIN (VALUES ('users'), ('bookings'), ('settings'), ('reports')) AS m(module)
CROSS JOIN (VALUES ('create'), ('read'), ('update'), ('delete')) AS a(action)
WHERE r.name = 'admin'
ON CONFLICT (role_id, module, action) DO NOTHING;

-- Insert default permissions for user role
INSERT INTO permissions (role_id, module, action)
SELECT r.id, m.module, a.action
FROM roles r
CROSS JOIN (VALUES ('bookings'), ('reports')) AS m(module)
CROSS JOIN (VALUES ('create'), ('read'), ('update')) AS a(action)
WHERE r.name = 'user'
ON CONFLICT (role_id, module, action) DO NOTHING;

-- Insert default permissions for viewer role
INSERT INTO permissions (role_id, module, action)
SELECT r.id, m.module, 'read'
FROM roles r
CROSS JOIN (VALUES ('bookings'), ('reports')) AS m(module)
WHERE r.name = 'viewer'
ON CONFLICT (role_id, module, action) DO NOTHING;
