import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Document {
  id: string;
  title: string;
  type: string;
  content: string | null;
  status: 'draft' | 'final';
  case_id: string | null;
  client_id: string | null;
  lawyer_id: string;
  created_at: string;
  case?: {
    id: string;
    number: string;
    title: string;
  };
  client?: {
    id: string;
    name: string;
  };
}

interface DocumentState {
  documents: Document[];
  loading: boolean;
  error: string | null;
  fetchDocuments: () => Promise<void>;
  addDocument: (data: Omit<Document, 'id' | 'created_at' | 'lawyer_id' | 'case' | 'client'>) => Promise<void>;
  updateDocument: (id: string, data: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  loading: false,
  error: null,

  fetchDocuments: async () => {
    set({ loading: true, error: null });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          case:cases (
            id,
            number,
            title
          ),
          client:clients (
            id,
            name
          )
        `)
        .eq('lawyer_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ documents: data || [], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addDocument: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Not authenticated');
      }

      const { data: newDocument, error } = await supabase
        .from('documents')
        .insert([{ ...data, lawyer_id: session.session.user.id }])
        .select(`
          *,
          case:cases (
            id,
            number,
            title
          ),
          client:clients (
            id,
            name
          )
        `)
        .single();

      if (error) throw error;
      set((state) => ({
        documents: [newDocument, ...state.documents],
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateDocument: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: updatedDocument, error } = await supabase
        .from('documents')
        .update(data)
        .eq('id', id)
        .select(`
          *,
          case:cases (
            id,
            number,
            title
          ),
          client:clients (
            id,
            name
          )
        `)
        .single();

      if (error) throw error;
      set((state) => ({
        documents: state.documents.map((d) => (d.id === id ? updatedDocument : d)),
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteDocument: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  }
}));