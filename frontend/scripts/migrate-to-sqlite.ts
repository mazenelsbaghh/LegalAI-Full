import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { hashPassword } from '../src/utils/crypto';

// SQLite database configuration
const DB_PATH = path.join(process.cwd(), 'public', 'legal-ai.db');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Initialize SQLite database
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

async function migrateToSQLite() {
  try {
    console.log('Starting migration to SQLite...');

    // Create SQLite tables
    console.log('Creating SQLite tables...');
    
    // Create profiles table
    db.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('lawyer', 'admin')),
        full_name TEXT,
        phone TEXT,
        address TEXT,
        license_number TEXT,
        specialization TEXT,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create clients table
    db.exec(`
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        type TEXT NOT NULL CHECK (type IN ('individual', 'company')),
        lawyer_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create cases table
    db.exec(`
      CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        number TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        court TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('open', 'closed', 'in_progress')),
        client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
        lawyer_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create appointments table
    db.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('court', 'meeting', 'deadline')),
        date TEXT NOT NULL,
        location TEXT,
        notes TEXT,
        case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
        client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
        lawyer_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create documents table
    db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT,
        status TEXT NOT NULL CHECK (status IN ('draft', 'final')),
        case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
        client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
        lawyer_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create invoices table
    db.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        number TEXT UNIQUE NOT NULL,
        amount REAL NOT NULL CHECK (amount >= 0),
        status TEXT NOT NULL CHECK (status IN ('paid', 'unpaid', 'overdue')),
        date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        due_date TEXT NOT NULL,
        client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
        lawyer_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create invoice_items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        amount REAL NOT NULL CHECK (amount >= 0),
        invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    console.log('Creating indexes...');
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
      CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
      CREATE INDEX IF NOT EXISTS idx_clients_lawyer_id ON clients(lawyer_id);
      CREATE INDEX IF NOT EXISTS idx_cases_lawyer_id ON cases(lawyer_id);
      CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_lawyer_id ON appointments(lawyer_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_case_id ON appointments(case_id);
      CREATE INDEX IF NOT EXISTS idx_documents_lawyer_id ON documents(lawyer_id);
      CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_lawyer_id ON invoices(lawyer_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
    `);

    // Create test users
    console.log('Creating test users...');
    
    const lawyerHash = await hashPassword('lawyer123');
    const adminHash = await hashPassword('admin123');

    db.exec(`
      INSERT OR REPLACE INTO profiles (id, email, role, full_name, password_hash, created_at)
      VALUES 
        ('lawyer-test-id', 'lawyer@example.com', 'lawyer', 'محامي النظام', '${lawyerHash}', CURRENT_TIMESTAMP),
        ('admin-test-id', 'admin@example.com', 'admin', 'مشرف النظام', '${adminHash}', CURRENT_TIMESTAMP)
    `);

    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    // Close database connection
    db.close();
  }
}

// Run migration
migrateToSQLite().catch(console.error);