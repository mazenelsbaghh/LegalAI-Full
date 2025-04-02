/*
  # Fix Authentication Setup

  1. Changes
    - Remove auth.config modification (not needed/accessible)
    - Simplify user creation process
    - Add proper error handling
    - Ensure idempotent operations
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to recreate test users safely
CREATE OR REPLACE FUNCTION recreate_test_users()
RETURNS void AS $$
DECLARE
  lawyer_id UUID := '11111111-1111-1111-1111-111111111111';
  admin_id UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
  -- Delete existing test users if they exist
  DELETE FROM auth.users WHERE email IN ('lawyer@example.com', 'admin@example.com');
  DELETE FROM public.profiles WHERE email IN ('lawyer@example.com', 'admin@example.com');

  -- Create lawyer user
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
    lawyer_id,
    '00000000-0000-0000-0000-000000000000',
    'lawyer@example.com',
    crypt('lawyer123', gen_salt('bf', 10)),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    'authenticated',
    'authenticated'
  );

  -- Create admin user
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
    admin_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@example.com',
    crypt('admin123', gen_salt('bf', 10)),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    'authenticated',
    'authenticated'
  );

  -- Create profiles
  INSERT INTO public.profiles (id, email, role)
  VALUES 
    (lawyer_id, 'lawyer@example.com', 'lawyer'),
    (admin_id, 'admin@example.com', 'admin');

EXCEPTION WHEN OTHERS THEN
  -- Log error details
  RAISE NOTICE 'Error creating test users: %', SQLERRM;
  -- Re-raise the error
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function
SELECT recreate_test_users();

-- Clean up
DROP FUNCTION recreate_test_users();