-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create function to handle new user registration with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- Ensure we have valid data
  IF NEW.id IS NULL OR NEW.email IS NULL THEN
    RAISE EXCEPTION 'Invalid user data: ID and email are required';
  END IF;

  -- Get role from metadata with validation
  DECLARE
    user_role text := COALESCE(NEW.raw_user_meta_data->>'role', 'lawyer');
  BEGIN
    IF user_role NOT IN ('lawyer', 'admin') THEN
      user_role := 'lawyer';
    END IF;
  END;

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
      specialization,
      created_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      user_role,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
      COALESCE(NEW.raw_user_meta_data->>'address', NULL),
      CASE 
        WHEN user_role = 'lawyer' THEN COALESCE(NEW.raw_user_meta_data->>'license_number', NULL)
        ELSE NULL
      END,
      CASE 
        WHEN user_role = 'lawyer' THEN COALESCE(NEW.raw_user_meta_data->>'specialization', NULL)
        ELSE NULL
      END,
      NOW()
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error details but don't expose them
    RAISE WARNING 'Error creating profile: %', SQLERRM;
    RETURN NULL;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Update RLS policies for profiles table
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;

CREATE POLICY "Enable read access for all authenticated users"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;