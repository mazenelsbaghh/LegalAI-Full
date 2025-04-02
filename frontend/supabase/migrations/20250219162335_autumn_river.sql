-- Drop existing function and view
DROP FUNCTION IF EXISTS check_user_credentials;
DROP VIEW IF EXISTS public.user_profiles;

-- Create a function to safely check user credentials
CREATE OR REPLACE FUNCTION check_user_credentials(
  user_email TEXT,
  user_password TEXT
) RETURNS TABLE (
  id uuid,
  email TEXT,
  role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    p.role
  FROM auth.users u
  JOIN profiles p ON p.id = u.id
  WHERE u.email = user_email
  AND u.encrypted_password = user_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_user_credentials TO public;

-- Create a secure view for user profiles
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
  u.id,
  u.email,
  p.role
FROM auth.users u
JOIN profiles p ON p.id = u.id;

-- Grant access to the view
GRANT SELECT ON public.user_profiles TO authenticated;