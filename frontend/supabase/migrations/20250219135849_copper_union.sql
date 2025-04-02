/*
  # Add test users

  1. New Data
    - Add test lawyer user
    - Add test admin user
    - Add corresponding profile entries
  
  2. Security
    - Uses Supabase auth.users for authentication
    - Links profiles to auth.users
*/

-- Create lawyer test user
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'lawyer@example.com'
  ) THEN
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data
    ) VALUES (
      'e50c5f66-1a6c-4ac1-8b21-c89b360c5ec7',
      'lawyer@example.com',
      crypt('lawyer123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb
    );
  END IF;
END $$;

-- Create admin test user
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
  ) THEN
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data
    ) VALUES (
      'f60c5f66-1a6c-4ac1-8b21-c89b360c5ec8',
      'admin@example.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb
    );
  END IF;
END $$;

-- Add lawyer profile
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = 'e50c5f66-1a6c-4ac1-8b21-c89b360c5ec7'
  ) THEN
    INSERT INTO profiles (id, email, role)
    VALUES (
      'e50c5f66-1a6c-4ac1-8b21-c89b360c5ec7',
      'lawyer@example.com',
      'lawyer'
    );
  END IF;
END $$;

-- Add admin profile
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = 'f60c5f66-1a6c-4ac1-8b21-c89b360c5ec8'
  ) THEN
    INSERT INTO profiles (id, email, role)
    VALUES (
      'f60c5f66-1a6c-4ac1-8b21-c89b360c5ec8',
      'admin@example.com',
      'admin'
    );
  END IF;
END $$;