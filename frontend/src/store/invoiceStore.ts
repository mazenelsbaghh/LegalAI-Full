import { create } from 'zustand';
import { getDB } from '../lib/db';
import { generateId } from '../utils/id';
import { useAuthStore } from './authStore';

interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  invoice_id: string;
  created_at: string;
}

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  date: string;
  due_date: string;
  client_id: string;
  lawyer_id: string;
  created_at: string;
  items?: InvoiceItem[];
  client?: {
    id: string;
    name: string;
  };
}

interface InvoiceState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  fetchInvoices: () => Promise<void>;
  addInvoice: (data: Omit<Invoice, 'id' | 'number' | 'created_at' | 'lawyer_id' | 'client'>, items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[]) => Promise<void>;
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  loading: false,
  error: null,

  fetchInvoices: async () => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      const db = await getDB();
      const tx = db.transaction(['invoices', 'invoice_items', 'clients'], 'readonly');
      const index = tx.objectStore('invoices').index('by-lawyer');
      const invoices = await index.getAll(user.id);

      // Get items and client info for each invoice
      const enrichedInvoices = await Promise.all(invoices.map(async (invoice) => {
        const itemsIndex = tx.objectStore('invoice_items').index('by-invoice');
        const clientStore = tx.objectStore('clients');
        
        const [items, client] = await Promise.all([
          itemsIndex.getAll(invoice.id),
          invoice.client_id ? clientStore.get(invoice.client_id) : null
        ]);

        return {
          ...invoice,
          items,
          client: client ? {
            id: client.id,
            name: client.name
          } : undefined
        };
      }));

      set({ 
        invoices: enrichedInvoices.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching invoices:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء جلب الفواتير', loading: false });
    }
  },

  addInvoice: async (data, items) => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      const db = await getDB();
      const id = generateId();
      const now = new Date().toISOString();
      const number = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      const newInvoice: Invoice = {
        id,
        number,
        amount: data.amount,
        status: data.status,
        date: data.date,
        due_date: data.due_date,
        client_id: data.client_id,
        lawyer_id: user.id,
        created_at: now
      };

      const tx = db.transaction(['invoices', 'invoice_items', 'clients'], 'readwrite');
      
      // Add invoice
      await tx.objectStore('invoices').add(newInvoice);

      // Add invoice items
      const itemsStore = tx.objectStore('invoice_items');
      await Promise.all(items.map(item => 
        itemsStore.add({
          id: generateId(),
          description: item.description,
          amount: item.amount,
          invoice_id: id,
          created_at: now
        })
      ));

      // Get client info
      const client = data.client_id ? 
        await tx.objectStore('clients').get(data.client_id) : null;

      await tx.done;

      const completeInvoice = {
        ...newInvoice,
        items: items.map(item => ({
          id: generateId(),
          description: item.description,
          amount: item.amount,
          invoice_id: id,
          created_at: now
        })),
        client: client ? {
          id: client.id,
          name: client.name
        } : undefined
      };

      set((state) => ({
        invoices: [completeInvoice, ...state.invoices],
        loading: false
      }));
    } catch (error) {
      console.error('Error adding invoice:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء إضافة الفاتورة', loading: false });
    }
  },

  updateInvoice: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      const db = await getDB();
      const tx = db.transaction(['invoices', 'clients'], 'readwrite');
      const store = tx.objectStore('invoices');
      const existingInvoice = await store.get(id);

      if (!existingInvoice || existingInvoice.lawyer_id !== user.id) {
        throw new Error('لا يمكن تحديث هذه الفاتورة');
      }

      const updatedInvoice = {
        ...existingInvoice,
        ...data
      };

      await store.put(updatedInvoice);

      // Get client info if needed
      const client = updatedInvoice.client_id ? 
        await tx.objectStore('clients').get(updatedInvoice.client_id) : null;

      await tx.done;

      set((state) => ({
        invoices: state.invoices.map((i) => (i.id === id ? {
          ...updatedInvoice,
          client: client ? {
            id: client.id,
            name: client.name
          } : undefined
        } : i)),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating invoice:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء تحديث الفاتورة', loading: false });
    }
  },

  deleteInvoice: async (id) => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      const db = await getDB();
      const tx = db.transaction(['invoices', 'invoice_items'], 'readwrite');
      const store = tx.objectStore('invoices');
      const existingInvoice = await store.get(id);

      if (!existingInvoice || existingInvoice.lawyer_id !== user.id) {
        throw new Error('لا يمكن حذف هذه الفاتورة');
      }

      // Delete invoice items first
      const itemsIndex = tx.objectStore('invoice_items').index('by-invoice');
      const items = await itemsIndex.getAllKeys(id);
      await Promise.all(items.map(itemId => 
        tx.objectStore('invoice_items').delete(itemId)
      ));

      // Delete invoice
      await store.delete(id);
      await tx.done;

      set((state) => ({
        invoices: state.invoices.filter((i) => i.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting invoice:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء حذف الفاتورة', loading: false });
    }
  }
}));