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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);