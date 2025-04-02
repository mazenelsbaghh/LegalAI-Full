-- Drop existing tables to ensure clean state
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table with proper schema
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

-- Create test users directly in auth.users
DO $$ 
DECLARE
  lawyer_id UUID := gen_random_uuid();
  admin_id UUID := gen_random_uuid();
BEGIN
  -- Delete existing test users if they exist
  DELETE FROM auth.users WHERE email IN ('lawyer@example.com', 'admin@example.com');
  DELETE FROM profiles WHERE email IN ('lawyer@example.com', 'admin@example.com');

  -- Create lawyer user
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    raw_user_meta_data,
    raw_app_meta_data,
    aud,
    role,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    lawyer_id,
    '00000000-0000-0000-0000-000000000000',
    'lawyer@example.com',
    jsonb_build_object('role', 'lawyer'),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    'authenticated',
    'authenticated',
    crypt('lawyer123', gen_salt('bf')),
    now(),
    now(),
    now(),
    now(),
    NULL,
    NULL
  );

  -- Create admin user
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    raw_user_meta_data,
    raw_app_meta_data,
    aud,
    role,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    admin_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@example.com',
    jsonb_build_object('role', 'admin'),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    'authenticated',
    'authenticated',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    now(),
    NULL,
    NULL
  );

  -- Create profiles for test users
  INSERT INTO profiles (id, email, role, full_name)
  VALUES 
    (lawyer_id, 'lawyer@example.com', 'lawyer', 'Test Lawyer'),
    (admin_id, 'admin@example.com', 'admin', 'Test Admin');
END $$;