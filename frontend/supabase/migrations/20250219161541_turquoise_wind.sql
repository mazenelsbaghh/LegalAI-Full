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

-- Function to create users with plain text passwords
CREATE OR REPLACE FUNCTION create_user_safely(
  user_email TEXT,
  user_password TEXT,
  user_role TEXT
) RETURNS uuid AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- First, ensure no existing user/profile
  DELETE FROM auth.users WHERE email = user_email;
  DELETE FROM profiles WHERE email = user_email;
  
  -- Generate new UUID
  new_user_id := gen_random_uuid();
  
  -- Create auth user with plain text password
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    raw_user_meta_data,
    created_at,
    updated_at,
    raw_app_meta_data,
    aud,
    role,
    encrypted_password
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    user_email,
    jsonb_build_object('password', user_password),
    now(),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', array['email']
    ),
    'authenticated',
    'authenticated',
    user_password
  );

  -- Create profile
  INSERT INTO profiles (id, email, role)
  VALUES (new_user_id, user_email, user_role);

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create test users with plain text passwords
DO $$ 
DECLARE
  lawyer_id UUID;
  admin_id UUID;
BEGIN
  -- Create lawyer user
  SELECT create_user_safely('lawyer@example.com', 'lawyer123', 'lawyer') INTO lawyer_id;
  
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