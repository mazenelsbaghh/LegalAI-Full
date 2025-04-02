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

-- Function to safely create users
CREATE OR REPLACE FUNCTION create_user_safely(
  user_email TEXT,
  user_password TEXT,
  user_role TEXT,
  user_full_name TEXT
) RETURNS uuid AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Generate new UUID
  new_user_id := gen_random_uuid();
  
  -- Create auth user
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
    confirmation_token,
    recovery_token,
    invited_at,
    is_super_admin
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', array['email']
    ),
    jsonb_build_object(
      'role', user_role,
      'full_name', user_full_name
    ),
    'authenticated',
    'authenticated',
    NULL,
    NULL,
    NULL,
    false
  );

  -- Create profile
  INSERT INTO profiles (id, email, role, full_name)
  VALUES (new_user_id, user_email, user_role, user_full_name);

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create test users
DO $$ 
BEGIN
  -- Delete existing test users if they exist
  DELETE FROM auth.users WHERE email IN ('lawyer@example.com', 'admin@example.com');
  DELETE FROM profiles WHERE email IN ('lawyer@example.com', 'admin@example.com');

  -- Create test users using the safe function
  PERFORM create_user_safely('lawyer@example.com', 'lawyer123', 'lawyer', 'Test Lawyer');
  PERFORM create_user_safely('admin@example.com', 'admin123', 'admin', 'Test Admin');
END $$;

-- Drop the function after use
DROP FUNCTION create_user_safely;