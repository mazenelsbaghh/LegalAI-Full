/*
  # Legal Platform Schema

  1. Tables
    - `clients` - Store client information
    - `cases` - Store case information
    - `appointments` - Store appointments and court dates
    - `documents` - Store legal documents
    - `invoices` - Store billing information
    - `invoice_items` - Store invoice line items

  2. Features
    - Auto-generated case and invoice numbers
    - Row Level Security (RLS) policies
    - Proper indexing for performance
    - Data integrity constraints
    - Cascading deletes for related records

  3. Security
    - RLS enabled on all tables
    - Policies for lawyer access to own data
    - Admin access to all data
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Create clients table first (no dependencies)
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

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyers can CRUD their own clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (
    lawyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create cases table (depends on clients)
CREATE TABLE cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL DEFAULT '',
  title text NOT NULL,
  type text NOT NULL,
  court text NOT NULL,
  status text NOT NULL CHECK (status IN ('open', 'closed', 'in_progress')),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyers can CRUD their own cases"
  ON cases
  FOR ALL
  TO authenticated
  USING (
    lawyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create appointments table (depends on cases and clients)
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

CREATE POLICY "Lawyers can CRUD their own appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (
    lawyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create documents table (depends on cases and clients)
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

CREATE POLICY "Lawyers can CRUD their own documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (
    lawyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create invoices table (depends on clients)
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

CREATE POLICY "Lawyers can CRUD their own invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (
    lawyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create invoice items table (depends on invoices)
CREATE TABLE invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyers can CRUD their own invoice items"
  ON invoice_items
  FOR ALL
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

-- Create functions for auto-generating numbers
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.number := 'C-' || to_char(now(), 'YYYY') || '-' || 
                lpad(cast(
                  (SELECT count(*) + 1 FROM cases 
                   WHERE extract(year from created_at) = extract(year from now()))
                as text), 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_case_number
  BEFORE INSERT ON cases
  FOR EACH ROW
  EXECUTE FUNCTION generate_case_number();

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
CREATE INDEX idx_cases_lawyer_id ON cases(lawyer_id);
CREATE INDEX idx_cases_client_id ON cases(client_id);
CREATE INDEX idx_clients_lawyer_id ON clients(lawyer_id);
CREATE INDEX idx_appointments_lawyer_id ON appointments(lawyer_id);
CREATE INDEX idx_appointments_case_id ON appointments(case_id);
CREATE INDEX idx_documents_lawyer_id ON documents(lawyer_id);
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_invoices_lawyer_id ON invoices(lawyer_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);