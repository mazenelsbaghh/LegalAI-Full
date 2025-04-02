-- Drop and recreate profiles table with proper schema
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('lawyer', 'admin')),
  full_name text,
  phone text,
  address text,
  license_number text,
  specialization text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies
CREATE POLICY "Enable read access for all authenticated users"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create real admin account with proper auth setup
DO $$ 
DECLARE
  admin_id UUID;
BEGIN
  -- Generate UUID for admin
  admin_id := gen_random_uuid();

  -- Delete existing admin if exists
  DELETE FROM auth.users WHERE email = 'admin@legalai.com';
  DELETE FROM profiles WHERE email = 'admin@legalai.com';

  -- Create admin user with proper auth setup
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    is_super_admin
  ) VALUES (
    admin_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@legalai.com',
    crypt('Admin@123!', gen_salt('bf', 12)),
    now(),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', array['email']
    ),
    jsonb_build_object(
      'role', 'admin',
      'is_super_admin', true
    ),
    'authenticated',
    'authenticated',
    true
  );

  -- Create admin profile
  INSERT INTO profiles (
    id,
    email,
    role,
    full_name
  ) VALUES (
    admin_id,
    'admin@legalai.com',
    'admin',
    'System Administrator'
  );

  -- Ensure proper auth schema setup
  ALTER TABLE auth.users ALTER COLUMN encrypted_password SET NOT NULL;
  ALTER TABLE auth.users ALTER COLUMN email_confirmed_at SET NOT NULL;
  
  -- Grant necessary permissions
  GRANT USAGE ON SCHEMA auth TO authenticated;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
  GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
END $$;