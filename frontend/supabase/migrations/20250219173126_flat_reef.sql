-- Drop existing RLS policy
DROP POLICY IF EXISTS "Lawyers can CRUD their own cases" ON cases;

-- Enable RLS on cases table
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Create new RLS policy for cases
CREATE POLICY "Lawyers can CRUD their own cases"
ON cases
FOR ALL
TO authenticated
USING (
  lawyer_id = auth.uid()
);

-- Create policy for admins to access all cases
CREATE POLICY "Admins can access all cases"
ON cases
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

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