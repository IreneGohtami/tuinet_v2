
-- Rename user-related tables
ALTER TABLE profiles RENAME TO user_profiles;
ALTER TABLE roles RENAME TO user_roles;
ALTER TABLE permissions RENAME TO user_permissions;

-- Rename settings tables
ALTER TABLE airlines RENAME TO settings_airlines;
ALTER TABLE regions RENAME TO settings_regions;
ALTER TABLE currencies RENAME TO settings_currencies;

-- Update foreign key constraint in user_permissions
ALTER TABLE user_permissions
  DROP CONSTRAINT permissions_role_id_fkey;

ALTER TABLE user_permissions
  ADD CONSTRAINT user_permissions_role_id_fkey
  FOREIGN KEY (role_id) REFERENCES user_roles(id) ON DELETE CASCADE;

-- Update RLS policies for user_profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admin full access for profiles" ON user_profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin full access for profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Update RLS policies for user_roles
DROP POLICY IF EXISTS "Admin read access for roles" ON user_roles;
DROP POLICY IF EXISTS "Admin full access for roles" ON user_roles;

CREATE POLICY "Admin read access for roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin full access for roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Update RLS policies for user_permissions
DROP POLICY IF EXISTS "Admin read access for permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admin full access for permissions" ON user_permissions;

CREATE POLICY "Admin read access for permissions" ON user_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin full access for permissions" ON user_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Update RLS policies for settings_airlines
DROP POLICY IF EXISTS "Public read access for airlines" ON settings_airlines;
DROP POLICY IF EXISTS "Admin full access for airlines" ON settings_airlines;

CREATE POLICY "Public read access for airlines" ON settings_airlines
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access for airlines" ON settings_airlines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Update RLS policies for settings_regions
DROP POLICY IF EXISTS "Public read access for regions" ON settings_regions;
DROP POLICY IF EXISTS "Admin full access for regions" ON settings_regions;

CREATE POLICY "Public read access for regions" ON settings_regions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access for regions" ON settings_regions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Update RLS policies for settings_currencies
DROP POLICY IF EXISTS "Public read access for currencies" ON settings_currencies;
DROP POLICY IF EXISTS "Admin full access for currencies" ON settings_currencies;

CREATE POLICY "Public read access for currencies" ON settings_currencies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access for currencies" ON settings_currencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );


-- Drop old trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate function with new table name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill: Create profiles for any existing users that don't have one
INSERT INTO public.user_profiles (id, email, full_name, role)
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name' as full_name,
  'user' as role
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;


-- Fix infinite recursion in user_profiles RLS policies
-- The issue: policies were checking user_profiles.role within the user_profiles table policies

-- Drop all existing policies on user_profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admin full access for profiles" ON user_profiles;

-- Recreate policies without circular dependencies
-- Allow authenticated users to read all profiles
CREATE POLICY "Authenticated users can view profiles" ON user_profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow users to insert their own profile (for signup)
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- For admin operations, use service role key (bypasses RLS)
-- Or create a separate admin check that doesn't query user_profiles
-- For now, we'll rely on service role for admin operations


-- Remove the hardcoded role check constraint from user_profiles
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Allow authenticated users to read roles and permissions
-- This is needed for the RBAC logic to work in server components and middleware

-- user_roles policies
DROP POLICY IF EXISTS "Authenticated users can read roles" ON user_roles;
CREATE POLICY "Authenticated users can read roles"
ON user_roles FOR SELECT
TO authenticated
USING (true);

-- user_permissions policies
DROP POLICY IF EXISTS "Authenticated users can read permissions" ON user_permissions;
CREATE POLICY "Authenticated users can read permissions"
ON user_permissions FOR SELECT
TO authenticated
USING (true);
