-- Drop and recreate profiles table with proper schema
DROP TABLE IF EXISTS profiles CASCADE;

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
  WITH CHECK (true);

CREATE POLICY "Enable update for own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function to handle new user registration with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
DECLARE
  default_role text := 'lawyer';
BEGIN
  -- Ensure we have valid data
  IF new.id IS NULL OR new.email IS NULL THEN
    RAISE EXCEPTION 'Invalid user data: ID and email are required';
  END IF;

  -- Get role from metadata or use default
  IF (new.raw_user_meta_data->>'role') IS NOT NULL AND 
     (new.raw_user_meta_data->>'role') IN ('lawyer', 'admin') THEN
    default_role := new.raw_user_meta_data->>'role';
  END IF;

  -- Insert profile with proper error handling
  BEGIN
    INSERT INTO public.profiles (
      id,
      email,
      role,
      full_name,
      phone,
      address,
      license_number,
      specialization
    )
    VALUES (
      new.id,
      new.email,
      default_role,
      COALESCE(new.raw_user_meta_data->>'full_name', ''),
      COALESCE(new.raw_user_meta_data->>'phone', NULL),
      COALESCE(new.raw_user_meta_data->>'address', NULL),
      COALESCE(new.raw_user_meta_data->>'license_number', NULL),
      COALESCE(new.raw_user_meta_data->>'specialization', NULL)
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error details but don't expose them to client
    RAISE WARNING 'Error creating profile: %', SQLERRM;
    -- Continue with the transaction, don't block user creation
    RETURN new;
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create test users with proper error handling
DO $$ 
DECLARE
  lawyer_id UUID := gen_random_uuid();
  admin_id UUID := gen_random_uuid();
BEGIN
  -- Delete existing test users if they exist
  DELETE FROM auth.users WHERE email IN ('lawyer@example.com', 'admin@example.com');
  DELETE FROM profiles WHERE email IN ('lawyer@example.com', 'admin@example.com');

  -- Create lawyer user
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
    role
  ) VALUES (
    lawyer_id,
    '00000000-0000-0000-0000-000000000000',
    'lawyer@example.com',
    crypt('lawyer123', gen_salt('bf', 10)),
    now(),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', array['email']
    ),
    jsonb_build_object(
      'role', 'lawyer',
      'full_name', 'Test Lawyer'
    ),
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
    last_sign_in_at,
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
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', array['email']
    ),
    jsonb_build_object(
      'role', 'admin',
      'full_name', 'Test Admin'
    ),
    'authenticated',
    'authenticated'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error creating test users: %', SQLERRM;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);