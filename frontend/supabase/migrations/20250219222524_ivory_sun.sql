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

-- Create test users directly with proper password hashing
DO $$ 
DECLARE
  lawyer_id UUID;
  admin_id UUID;
BEGIN
  -- Generate UUIDs
  lawyer_id := gen_random_uuid();
  admin_id := gen_random_uuid();

  -- Delete existing test users if they exist
  DELETE FROM auth.users WHERE email IN ('lawyer@example.com', 'admin@example.com');
  DELETE FROM profiles WHERE email IN ('lawyer@example.com', 'admin@example.com');

  -- Create lawyer user with proper password hashing
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
    role
  ) VALUES (
    lawyer_id,
    '00000000-0000-0000-0000-000000000000',
    'lawyer@example.com',
    -- Use proper password hashing with bcrypt
    crypt('lawyer123', gen_salt('bf', 10)),
    now(),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', array['email']
    ),
    jsonb_build_object(
      'role', 'lawyer'
    ),
    'authenticated',
    'authenticated'
  );

  -- Create admin user with proper password hashing
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
    role
  ) VALUES (
    admin_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@example.com',
    -- Use proper password hashing with bcrypt
    crypt('admin123', gen_salt('bf', 10)),
    now(),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', array['email']
    ),
    jsonb_build_object(
      'role', 'admin'
    ),
    'authenticated',
    'authenticated'
  );

  -- Create profiles for test users
  INSERT INTO profiles (id, email, role, full_name)
  VALUES 
    (lawyer_id, 'lawyer@example.com', 'lawyer', 'Test Lawyer'),
    (admin_id, 'admin@example.com', 'admin', 'Test Admin');
END $$;