-- Drop existing function and view
DROP FUNCTION IF EXISTS check_user_credentials;
DROP VIEW IF EXISTS public.user_profiles;

-- Create a function to safely check user credentials with proper type handling
CREATE OR REPLACE FUNCTION check_user_credentials(
  user_email VARCHAR(255),
  user_password VARCHAR(255)
) RETURNS TABLE (
  id uuid,
  email VARCHAR(255),
  role VARCHAR(255)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email::VARCHAR(255),
    p.role::VARCHAR(255)
  FROM auth.users u
  JOIN profiles p ON p.id = u.id
  WHERE u.email = user_email
  AND u.encrypted_password = user_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_user_credentials TO public;

-- Create a secure view for user profiles with proper type casting
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
  u.id,
  u.email::VARCHAR(255) as email,
  p.role::VARCHAR(255) as role
FROM auth.users u
JOIN profiles p ON p.id = u.id;

-- Grant access to the view
GRANT SELECT ON public.user_profiles TO authenticated;