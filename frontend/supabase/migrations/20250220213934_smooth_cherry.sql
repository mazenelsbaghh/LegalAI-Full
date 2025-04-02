/*
  # Add business tables safely

  1. New Tables (if not exist)
    - appointments
    - documents
    - invoices
    - invoice_items

  2. Security
    - Enable RLS
    - Add policies
    - Create indexes
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;

-- Create appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('court', 'meeting', 'deadline')),
  date timestamptz NOT NULL,
  location text,
  notes text,
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for own appointments"
  ON appointments
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

CREATE POLICY "Enable insert for own appointments"
  ON appointments
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

CREATE POLICY "Enable update for own appointments"
  ON appointments
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

CREATE POLICY "Enable delete for own appointments"
  ON appointments
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

-- Create documents table
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL,
  content text,
  status text NOT NULL CHECK (status IN ('draft', 'final')),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for own documents"
  ON documents
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

CREATE POLICY "Enable insert for own documents"
  ON documents
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

CREATE POLICY "Enable update for own documents"
  ON documents
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

CREATE POLICY "Enable delete for own documents"
  ON documents
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

-- Create invoices table
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL DEFAULT '',
  amount numeric NOT NULL CHECK (amount >= 0),
  status text NOT NULL CHECK (status IN ('paid', 'unpaid', 'overdue')),
  date timestamptz NOT NULL DEFAULT now(),
  due_date timestamptz NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for own invoices"
  ON invoices
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

CREATE POLICY "Enable insert for own invoices"
  ON invoices
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

CREATE POLICY "Enable update for own invoices"
  ON invoices
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

CREATE POLICY "Enable delete for own invoices"
  ON invoices
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

-- Create invoice items table
CREATE TABLE invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for own invoice items"
  ON invoice_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND (
        invoices.lawyer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Enable insert for own invoice items"
  ON invoice_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND (
        invoices.lawyer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Enable update for own invoice items"
  ON invoice_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND (
        invoices.lawyer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND (
        invoices.lawyer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Enable delete for own invoice items"
  ON invoice_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND (
        invoices.lawyer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      )
    )
  );

-- Create function for auto-generating invoice numbers
DROP FUNCTION IF EXISTS generate_invoice_number CASCADE;
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.number := 'INV-' || to_char(now(), 'YYYY') || '-' || 
                lpad(cast(
                  (SELECT count(*) + 1 FROM invoices 
                   WHERE extract(year from created_at) = extract(year from now()))
                as text), 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_lawyer_id ON appointments(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_case_id ON appointments(case_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);

CREATE INDEX IF NOT EXISTS idx_documents_lawyer_id ON documents(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

CREATE INDEX IF NOT EXISTS idx_invoices_lawyer_id ON invoices(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);