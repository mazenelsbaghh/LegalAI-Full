-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role text;
BEGIN
  -- Input validation with detailed errors
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;
  
  IF NEW.email IS NULL THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  -- Get and validate role with proper defaults
  BEGIN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'lawyer');
    IF user_role NOT IN ('lawyer', 'admin') THEN
      user_role := 'lawyer';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Default to lawyer if any error occurs
    user_role := 'lawyer';
  END;

  -- Create profile with transaction control
  BEGIN
    -- Ensure no duplicate profile exists
    DELETE FROM public.profiles WHERE id = NEW.id OR email = NEW.email;

    -- Create new profile
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
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NEW.email),
      NULLIF(NEW.raw_user_meta_data->>'phone', ''),
      NULLIF(NEW.raw_user_meta_data->>'address', ''),
      CASE 
        WHEN user_role = 'lawyer' THEN NULLIF(NEW.raw_user_meta_data->>'license_number', '')
        ELSE NULL
      END,
      CASE 
        WHEN user_role = 'lawyer' THEN NULLIF(NEW.raw_user_meta_data->>'specialization', '')
        ELSE NULL
      END,
      NOW()
    );

    RETURN NEW;
  EXCEPTION WHEN OTHERS THEN
    -- Log error details for debugging
    RAISE WARNING 'Profile creation failed for user % (%): %', NEW.id, NEW.email, SQLERRM;
    -- Continue with user creation even if profile fails
    RETURN NEW;
  END;
END;
$$;

-- Create new trigger with proper timing
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Update RLS policies to be more permissive during signup
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;

-- Allow reading profiles
CREATE POLICY "Enable read access for all authenticated users"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow profile creation during signup
CREATE POLICY "Enable insert for authenticated users"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own profiles
CREATE POLICY "Enable update for own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure proper permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;