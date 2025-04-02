-- Drop existing function and view
DROP FUNCTION IF EXISTS check_user_credentials;
DROP VIEW IF EXISTS public.user_profiles;

-- Create a function to safely check user credentials with correct types
CREATE OR REPLACE FUNCTION check_user_credentials(
  user_email VARCHAR,
  user_password VARCHAR
) RETURNS TABLE (
  id uuid,
  email VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email::VARCHAR
  FROM auth.users u
  WHERE u.email = user_email
  AND u.encrypted_password = user_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_user_credentials TO authenticated;

-- Create a secure view for user data that doesn't expose sensitive information
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
  u.id,
  u.email::VARCHAR as email,
  p.role
FROM auth.users u
JOIN profiles p ON p.id = u.id;

-- Grant access to the view
GRANT SELECT ON public.user_profiles TO authenticated;

-- Update the auth store to use the new function and view
COMMENT ON FUNCTION check_user_credentials IS 'Securely check user credentials without exposing sensitive data';
COMMENT ON VIEW public.user_profiles IS 'Safe view of user profile data without exposing sensitive information';