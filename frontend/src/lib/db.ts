import type { Profile } from './database.types';
// SQLite is only available on the server side
// This is a browser-compatible interface

// Mock database for browser
const mockDb = {
  prepare: () => ({
    run: (...args: any[]) => {},
    get: (...args: any[]) => null,
    all: (...args: any[]) => []
  }),
  transaction: (fn: Function) => fn(),
  exec: () => {},
  pragma: () => {},
  add: (table: string, data: any) => {},
  get: (table: string, id: string) => null,
  put: (table: string, data: any) => {},
  delete: (table: string, id: string) => {}
};

// Export mock database instance for browser
export const getDB = () => mockDb;

export async function getUserByEmail(email: string) {
  // Mock implementation for browser
  const testUsers = {
    'lawyer@example.com': {
      id: 'lawyer-test-id',
      email: 'lawyer@example.com',
      role: 'lawyer',
      full_name: 'Test Lawyer',
      password_hash: 'lawyer123'
    },
    'admin@example.com': {
      id: 'admin-test-id', 
      email: 'admin@example.com',
      role: 'admin',
      full_name: 'Test Admin',
      password_hash: 'admin123'
    }
  };
  return testUsers[email] || null;
}

export async function createUser(user: Omit<Profile, 'id' | 'created_at'>) {
  // Mock implementation for browser
  return { ...user, id: crypto.randomUUID(), created_at: new Date().toISOString() };
}

export async function updateUser(id: string, data: Partial<Profile>) {
  // Mock implementation for browser
  return null;
}

export async function deleteUser(id: string) {
  // Mock implementation for browser
}

export async function getCasesByLawyerId(lawyerId: string) {
  // Mock implementation for browser
  return [];
}

export async function getClientsByLawyerId(lawyerId: string) {
  // Mock implementation for browser
  return [];
}

export async function getMessagesByUserId(userId: string) {
  // Mock implementation for browser
  return [];
}

export type { Profile };