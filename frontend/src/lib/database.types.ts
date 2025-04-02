// Basic types for in-memory database
export interface Profile {
  id: string;
  email: string;
  role: 'lawyer' | 'admin';
  full_name?: string | null;
  phone?: string | null;
  address?: string | null;
  license_number?: string | null;
  specialization?: string | null;
  password_hash: string;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  type: 'individual' | 'company';
  lawyer_id: string;
  created_at: string;
}

export interface Case {
  id: string;
  number: string;
  title: string;
  type: string;
  court: string;
  status: 'open' | 'closed' | 'in_progress';
  client_id?: string;
  lawyer_id: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  title: string;
  type: 'court' | 'meeting' | 'deadline';
  date: string;
  location?: string;
  notes?: string;
  case_id?: string;
  client_id?: string;
  lawyer_id: string;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  type: string;
  content?: string;
  status: 'draft' | 'final';
  case_id?: string;
  client_id?: string;
  lawyer_id: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  date: string;
  due_date: string;
  client_id: string;
  lawyer_id: string;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  invoice_id: string;
  created_at: string;
}