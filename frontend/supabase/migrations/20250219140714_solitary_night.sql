/*
  # Fix test user creation

  1. Changes
    - Create test users with proper authentication
    - Ensure profiles are created with correct roles
    - Add proper error handling for existing users

  2. Security
    - Use secure password hashing
    - Proper role assignment
*/

-- Function to create users safely
CREATE OR REPLACE FUNCTION create_auth_user(
  user_email TEXT,
  user_password TEXT,
  user_role TEXT
) RETURNS void AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create auth user if not exists
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  )
  SELECT
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = user_email
  )
  RETURNING id INTO new_user_id;

  -- Get user id if user already exists
  IF new_user_id IS NULL THEN
    SELECT id INTO new_user_id FROM auth.users WHERE email = user_email;
  END IF;

  -- Create or update profile
  INSERT INTO public.profiles (id, email, role)
  VALUES (new_user_id, user_email, user_role)
  ON CONFLICT (id) DO UPDATE
  SET role = user_role;
END;
$$ LANGUAGE plpgsql;

-- Create test users
SELECT create_auth_user('lawyer@example.com', 'lawyer123', 'lawyer');
SELECT create_auth_user('admin@example.com', 'admin123', 'admin');

-- Clean up
DROP FUNCTION create_auth_user;