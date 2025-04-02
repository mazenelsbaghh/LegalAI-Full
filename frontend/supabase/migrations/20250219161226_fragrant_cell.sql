-- Drop existing profiles table
DROP TABLE IF EXISTS profiles CASCADE;

-- Recreate profiles table with proper constraints
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
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function to safely create users with retries and proper session handling
CREATE OR REPLACE FUNCTION create_user_safely(
  user_email TEXT,
  user_password TEXT,
  user_role TEXT,
  max_retries INTEGER DEFAULT 5
) RETURNS uuid AS $$
DECLARE
  new_user_id UUID;
  retry_count INTEGER := 0;
BEGIN
  -- First, ensure no existing user/profile
  DELETE FROM auth.users WHERE email = user_email;
  DELETE FROM profiles WHERE email = user_email;
  
  -- Generate new UUID
  new_user_id := gen_random_uuid();
  
  -- Create auth user with explicit session handling
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

  -- Small delay to ensure auth user is fully created
  PERFORM pg_sleep(0.5);

  -- Create profile
  INSERT INTO profiles (id, email, role)
  VALUES (new_user_id, user_email, user_role);

  -- Small delay to ensure profile is fully created
  PERFORM pg_sleep(0.5);

  -- Verify both user and profile exist
  IF NOT EXISTS (
    SELECT 1 FROM auth.users u
    JOIN profiles p ON p.id = u.id
    WHERE u.id = new_user_id
  ) THEN
    RAISE EXCEPTION 'Failed to verify user creation';
  END IF;

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create test users
DO $$ 
DECLARE
  lawyer_id UUID;
  admin_id UUID;
BEGIN
  -- Create lawyer user
  SELECT create_user_safely('lawyer@example.com', 'lawyer123', 'lawyer') INTO lawyer_id;
  
  -- Small delay between user creations
  PERFORM pg_sleep(1);
  
  -- Create admin user
  SELECT create_user_safely('admin@example.com', 'admin123', 'admin') INTO admin_id;
  
  -- Verify users were created
  IF NOT EXISTS (
    SELECT 1 FROM auth.users u
    JOIN profiles p ON p.id = u.id
    WHERE u.email IN ('lawyer@example.com', 'admin@example.com')
  ) THEN
    RAISE EXCEPTION 'Failed to verify user creation';
  END IF;
END $$;

-- Clean up
DROP FUNCTION create_user_safely;