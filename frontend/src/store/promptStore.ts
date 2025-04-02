import { create } from 'zustand';
import { getDB } from '../lib/db';

interface Prompt {
  id: string;
  content: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface PromptState {
  prompts: Prompt[];
  loading: boolean;
  error: string | null;
  fetchPrompts: () => Promise<void>;
  addPrompt: (prompt: { content: string; is_default: boolean }) => Promise<void>;
  updatePrompt: (id: string, prompt: Partial<{ content: string; is_default: boolean }>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  setDefaultPrompt: (id: string) => Promise<void>;
}

export const usePromptStore = create<PromptState>((set) => ({
  prompts: [],
  loading: false,
  error: null,

  fetchPrompts: async () => {
    set({ loading: true, error: null });
    try {
      const db = getDB();
      const prompts = db.prepare(`
        SELECT * FROM prompts 
        ORDER BY created_at DESC
      `).all();
      
      set({ prompts: prompts || [], loading: false });
    } catch (error) {
      console.error('Error fetching prompts:', error);
      set({ error: 'Failed to fetch prompts', loading: false });
    }
  },

  addPrompt: async (promptData) => {
    set({ loading: true, error: null });
    try {
      const db = getDB();
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      
      const prompt = {
        id,
        ...promptData,
        created_at: now,
        updated_at: now
      };
      
      db.prepare(`
        INSERT INTO prompts (id, content, is_default, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        prompt.id,
        prompt.content,
        prompt.is_default,
        prompt.created_at,
        prompt.updated_at
      );
      
      set(state => ({
        prompts: [prompt, ...state.prompts],
        loading: false
      }));
    } catch (error) {
      console.error('Error adding prompt:', error);
      set({ error: 'Failed to add prompt', loading: false });
    }
  },

  updatePrompt: async (id, promptData) => {
    set({ loading: true, error: null });
    try {
      const db = getDB();
      const now = new Date().toISOString();
      
      db.prepare(`
        UPDATE prompts 
        SET content = COALESCE(?, content),
            is_default = COALESCE(?, is_default),
            updated_at = ?
        WHERE id = ?
      `).run(
        promptData.content,
        promptData.is_default,
        now,
        id
      );
      
      const updatedPrompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(id);
      
      set(state => ({
        prompts: state.prompts.map(p => p.id === id ? updatedPrompt : p),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating prompt:', error);
      set({ error: 'Failed to update prompt', loading: false });
    }
  },

  deletePrompt: async (id) => {
    set({ loading: true, error: null });
    try {
      const db = getDB();
      db.prepare('DELETE FROM prompts WHERE id = ?').run(id);
      
      set(state => ({
        prompts: state.prompts.filter(p => p.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting prompt:', error);
      set({ error: 'Failed to delete prompt', loading: false });
    }
  },

  setDefaultPrompt: async (id) => {
    set({ loading: true, error: null });
    try {
      const db = getDB();
      // Use transaction to update prompts
      db.transaction(() => {
        // Reset all prompts to not default
        db.prepare('UPDATE prompts SET is_default = false WHERE id != ?').run(id);
        
        // Set selected prompt as default
        db.prepare('UPDATE prompts SET is_default = true WHERE id = ?').run(id);
      })();
      
      // Refresh prompts
      const updatedPrompts = db.prepare('SELECT * FROM prompts ORDER BY created_at DESC').all();
      
      set({ prompts: updatedPrompts || [], loading: false });
    } catch (error) {
      console.error('Error setting default prompt:', error);
      set({ error: 'Failed to set default prompt', loading: false });
    }
  }
}));