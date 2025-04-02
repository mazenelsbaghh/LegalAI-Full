/*
  # Reset and recreate test users

  1. Changes
    - Delete existing test users before recreation
    - Create new users with proper UUIDs
    - Set up profiles with correct roles

  2. Security
    - Proper password encryption
    - Role assignment
*/

-- Function to manage users safely
CREATE OR REPLACE FUNCTION manage_auth_user(
  user_email TEXT,
  user_password TEXT,
  user_role TEXT
) RETURNS void AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Delete existing user if exists
  DELETE FROM auth.users WHERE email = user_email;
  
  -- Generate new UUID for user
  new_user_id := gen_random_uuid();
  
  -- Create new user with explicit ID
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
    crypt(user_password, gen_salt('bf')),
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

  -- Delete existing profile if exists
  DELETE FROM public.profiles WHERE email = user_email;

  -- Create new profile
  INSERT INTO public.profiles (
    id,
    email,
    role
  )
  VALUES (
    new_user_id,
    user_email,
    user_role
  );
END;
$$ LANGUAGE plpgsql;

-- Recreate test users
SELECT manage_auth_user('lawyer@example.com', 'lawyer123', 'lawyer');
SELECT manage_auth_user('admin@example.com', 'admin123', 'admin');

-- Clean up
DROP FUNCTION manage_auth_user;