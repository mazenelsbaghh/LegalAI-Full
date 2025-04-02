-- Drop and recreate clients table with proper RLS
DROP TABLE IF EXISTS clients CASCADE;

CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  type text NOT NULL CHECK (type IN ('individual', 'company')),
  lawyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Lawyers can CRUD their own clients" ON clients;
DROP POLICY IF EXISTS "Enable read for own clients" ON clients;
DROP POLICY IF EXISTS "Enable insert for own clients" ON clients;
DROP POLICY IF EXISTS "Enable update for own clients" ON clients;
DROP POLICY IF EXISTS "Enable delete for own clients" ON clients;

-- Create new RLS policies for clients
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

-- Create indexes for better performance
CREATE INDEX idx_clients_lawyer_id ON clients(lawyer_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_type ON clients(type);