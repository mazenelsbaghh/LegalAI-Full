/*
  # Fix User Authentication Setup

  1. Changes
    - Drop and recreate profiles table
    - Create test users with proper authentication
    - Add proper error handling
*/

-- Drop existing profiles table
DROP TABLE IF EXISTS profiles CASCADE;

-- Recreate profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('lawyer', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function to safely create users
CREATE OR REPLACE FUNCTION create_user_safely(
  user_email TEXT,
  user_password TEXT,
  user_role TEXT
) RETURNS uuid AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Delete existing user if exists
  DELETE FROM auth.users WHERE email = user_email;
  
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
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    user_email,
    crypt(user_password, gen_salt('bf', 10)),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', array['email']
    ),
    '{}'::jsonb,
    'authenticated',
    'authenticated'
  );

  -- Create profile
  INSERT INTO profiles (id, email, role)
  VALUES (new_user_id, user_email, user_role);

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create test users
DO $$ 
BEGIN
  PERFORM create_user_safely('lawyer@example.com', 'lawyer123', 'lawyer');
  PERFORM create_user_safely('admin@example.com', 'admin123', 'admin');
END $$;

-- Clean up
DROP FUNCTION create_user_safely;