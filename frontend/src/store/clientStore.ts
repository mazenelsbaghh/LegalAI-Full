import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { getDB } from '../lib/db';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  type: 'individual' | 'company';
  lawyer_id: string;
  created_at: string;
}

interface ClientState {
  clients: Client[];
  loading: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  addClient: (data: Omit<Client, 'id' | 'created_at' | 'lawyer_id'>) => Promise<void>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

export const useClientStore = create<ClientState>((set) => ({
  clients: [],
  loading: false,
  error: null,

  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');

      const db = getDB();
      
      const clients = db.prepare(`
        SELECT * FROM clients 
        WHERE lawyer_id = ?
        ORDER BY created_at DESC
      `).all(user.id);
      
      set({ clients, loading: false });
    } catch (error) {
      console.error('Error fetching clients:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء جلب العملاء', loading: false });
    }
  },

  addClient: async (data) => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');

      const db = getDB();
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      
      const newClient = {
        id,
        ...data,
        lawyer_id: user.id,
        created_at: now
      };
      
      db.prepare(`
        INSERT INTO clients (id, name, email, phone, address, type, lawyer_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newClient.id,
        newClient.name,
        newClient.email,
        newClient.phone,
        newClient.address,
        newClient.type,
        newClient.lawyer_id,
        newClient.created_at
      );
      
      set(state => ({
        clients: [...state.clients, newClient],
        loading: false
      }));
    } catch (error) {
      console.error('Error adding client:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء إضافة العميل', loading: false });
    }
  },

  updateClient: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');

      const db = getDB();
      db.prepare(`
        UPDATE clients 
        SET name = COALESCE(?, name),
            email = COALESCE(?, email),
            phone = COALESCE(?, phone),
            address = COALESCE(?, address),
            type = COALESCE(?, type)
        WHERE id = ? AND lawyer_id = ?
      `).run(
        data.name,
        data.email,
        data.phone,
        data.address,
        data.type,
        id,
        user.id
      );
      
      const updatedClient = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
      
      set(state => ({
        clients: state.clients.map(c => c.id === id ? updatedClient : c),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating client:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء تحديث العميل', loading: false });
    }
  },

  deleteClient: async (id) => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');
      
      const db = getDB();
      db.prepare('DELETE FROM clients WHERE id = ? AND lawyer_id = ?').run(id, user.id);
      
      set(state => ({
        clients: state.clients.filter(c => c.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting client:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء حذف العميل', loading: false });
    }
  }
}));