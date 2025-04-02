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

-- Function to safely create users with retries
CREATE OR REPLACE FUNCTION create_user_safely(
  user_email TEXT,
  user_password TEXT,
  user_role TEXT,
  max_retries INTEGER DEFAULT 3
) RETURNS uuid AS $$
DECLARE
  new_user_id UUID;
  retry_count INTEGER := 0;
BEGIN
  WHILE retry_count < max_retries LOOP
    BEGIN
      -- Delete existing user if exists
      DELETE FROM auth.users WHERE email = user_email;
      DELETE FROM profiles WHERE email = user_email;
      
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

      -- If we get here, everything worked
      RETURN new_user_id;

    EXCEPTION WHEN OTHERS THEN
      -- If this was our last retry, re-raise the error
      IF retry_count = max_retries - 1 THEN
        RAISE;
      END IF;
      
      -- Otherwise, increment retry count and try again
      retry_count := retry_count + 1;
      -- Wait for a moment before retrying (100ms)
      PERFORM pg_sleep(0.1);
    END;
  END LOOP;
  
  -- We should never get here, but just in case
  RAISE EXCEPTION 'Failed to create user after % retries', max_retries;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create test users with retries
DO $$ 
DECLARE
  lawyer_id UUID;
  admin_id UUID;
BEGIN
  -- Create lawyer user
  SELECT create_user_safely('lawyer@example.com', 'lawyer123', 'lawyer', 3) INTO lawyer_id;
  
  -- Create admin user
  SELECT create_user_safely('admin@example.com', 'admin123', 'admin', 3) INTO admin_id;
  
  -- Verify users were created
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email IN ('lawyer@example.com', 'admin@example.com')
  ) THEN
    RAISE EXCEPTION 'Failed to verify user creation';
  END IF;
END $$;

-- Clean up
DROP FUNCTION create_user_safely;