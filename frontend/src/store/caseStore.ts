import { create } from 'zustand';
import { getCasesByLawyerId, getDB } from '../lib/db';
import { useAuthStore } from './authStore';
import { generateId } from '../utils/id';

interface Case {
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

interface CaseState {
  cases: Case[];
  loading: boolean;
  error: string | null;
  fetchCases: () => Promise<void>;
  addCase: (data: Omit<Case, 'id' | 'created_at' | 'updated_at' | 'lawyer_id'>) => Promise<void>;
  updateCase: (id: string, data: Partial<Case>) => Promise<void>;
  deleteCase: (id: string) => Promise<void>;
}

export const useCaseStore = create<CaseState>((set) => ({
  cases: [],
  loading: false,
  error: null,

  fetchCases: async () => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');
      
      const cases = await getCasesByLawyerId(user.id);
      set({ cases, loading: false });
    } catch (error) {
      console.error('Error fetching cases:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء جلب القضايا', loading: false });
    }
  },

  addCase: async (data) => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');

      const db = getDB();
      const id = generateId();
      const now = new Date().toISOString();

      const newCase = {
        id,
        ...data,
        lawyer_id: user.id,
        created_at: now,
        updated_at: now
      };

      await db.add('cases', newCase);

      set(state => ({
        cases: [...state.cases, newCase],
        loading: false
      }));
    } catch (error) {
      console.error('Error adding case:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء إضافة القضية', loading: false });
    }
  },

  updateCase: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');

      const db = getDB();
      const existingCase = await db.get('cases', id);
      if (!existingCase || existingCase.lawyer_id !== user.id) {
        throw new Error('لا يمكن تحديث هذه القضية');
      }

      const updatedCase = {
        ...existingCase,
        ...data,
        id,
        lawyer_id: user.id
      };
      
      await db.put('cases', updatedCase);

      set(state => ({
        cases: state.cases.map(c => c.id === id ? { ...c, ...data } : c),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating case:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء تحديث القضية', loading: false });
    }
  },

  deleteCase: async (id) => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');

      const db = getDB();
      const existingCase = await db.get('cases', id);
      if (!existingCase || existingCase.lawyer_id !== user.id) {
        throw new Error('لا يمكن حذف هذه القضية');
      }
      
      await db.delete('cases', id);

      set(state => ({
        cases: state.cases.filter(c => c.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting case:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء حذف القضية', loading: false });
    }
  }
}));