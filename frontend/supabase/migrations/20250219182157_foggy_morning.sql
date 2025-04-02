-- Drop existing RLS policies
DROP POLICY IF EXISTS "Lawyers can CRUD their own clients" ON clients;

-- Enable RLS on clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients
CREATE POLICY "Enable read for own clients"
  ON clients
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

CREATE POLICY "Enable insert for own clients"
  ON clients
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

CREATE POLICY "Enable update for own clients"
  ON clients
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

CREATE POLICY "Enable delete for own clients"
  ON clients
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