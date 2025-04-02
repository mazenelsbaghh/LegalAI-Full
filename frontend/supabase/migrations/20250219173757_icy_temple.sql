-- Drop existing RLS policy
DROP POLICY IF EXISTS "Lawyers can CRUD their own cases" ON cases;
DROP POLICY IF EXISTS "Admins can access all cases" ON cases;

-- Enable RLS on cases table
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Create new RLS policy for cases that allows all authenticated users to access
CREATE POLICY "Allow all authenticated users to access cases"
ON cases
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS check_user_credentials(TEXT, TEXT);

-- Create function to check user credentials with a more specific name
CREATE OR REPLACE FUNCTION check_lawyer_credentials(
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
  AND u.raw_user_meta_data->>'password' = user_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION check_lawyer_credentials TO public;