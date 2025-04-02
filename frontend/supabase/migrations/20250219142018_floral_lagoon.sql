/*
  # Fix Authentication and Profiles Setup

  1. Changes
    - Enable UUID extension
    - Recreate profiles table with proper constraints
    - Set up RLS policies for profiles
    - Create test users with proper auth setup

  2. Security
    - Enable RLS on profiles table
    - Add policies for user access control
    - Ensure secure password hashing
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Recreate the profiles table with proper constraints
DROP TABLE IF EXISTS profiles CASCADE;
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

-- Function to safely create users with proper ID generation
CREATE OR REPLACE FUNCTION create_user_safely(
  user_email TEXT,
  user_password TEXT,
  user_role TEXT
) RETURNS uuid AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Generate UUID first
  new_user_id := gen_random_uuid();
  
  -- Create auth user with explicit ID
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

-- Remove existing test users if they exist
DELETE FROM auth.users WHERE email IN ('lawyer@example.com', 'admin@example.com');
DELETE FROM profiles WHERE email IN ('lawyer@example.com', 'admin@example.com');

-- Create test users
DO $$ 
DECLARE
  lawyer_id UUID;
  admin_id UUID;
BEGIN
  SELECT create_user_safely('lawyer@example.com', 'lawyer123', 'lawyer') INTO lawyer_id;
  SELECT create_user_safely('admin@example.com', 'admin123', 'admin') INTO admin_id;
END $$;

-- Clean up
DROP FUNCTION create_user_safely;