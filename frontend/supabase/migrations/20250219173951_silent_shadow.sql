-- Drop existing RLS policies
DROP POLICY IF EXISTS "Allow all authenticated users to access cases" ON cases;
DROP POLICY IF EXISTS "Lawyers can CRUD their own cases" ON cases;
DROP POLICY IF EXISTS "Admins can access all cases" ON cases;

-- Enable RLS on cases table
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cases
CREATE POLICY "Enable read access for all users"
ON cases
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for all users"
ON cases
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON cases
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for all users"
ON cases
FOR DELETE
TO authenticated
USING (true);

-- Create function to check user credentials
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