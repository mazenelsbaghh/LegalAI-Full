-- Drop existing RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON cases;
DROP POLICY IF EXISTS "Enable insert for all users" ON cases;
DROP POLICY IF EXISTS "Enable update for all users" ON cases;
DROP POLICY IF EXISTS "Enable delete for all users" ON cases;
DROP POLICY IF EXISTS "Allow all authenticated users to access cases" ON cases;
DROP POLICY IF EXISTS "Lawyers can CRUD their own cases" ON cases;
DROP POLICY IF EXISTS "Admins can access all cases" ON cases;

-- Enable RLS on cases table
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cases with proper authentication
CREATE POLICY "Lawyers can read their own cases"
ON cases
FOR SELECT
TO authenticated
USING (
  lawyer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Lawyers can insert their own cases"
ON cases
FOR INSERT
TO authenticated
WITH CHECK (
  lawyer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Lawyers can update their own cases"
ON cases
FOR UPDATE
TO authenticated
USING (
  lawyer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  lawyer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Lawyers can delete their own cases"
ON cases
FOR DELETE
TO authenticated
USING (
  lawyer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);