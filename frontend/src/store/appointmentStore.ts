import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { getDB } from '../lib/db';
import { generateId } from '../utils/id';

interface Appointment {
  id: string;
  title: string;
  type: 'court' | 'meeting' | 'deadline';
  date: string;
  location: string;
  notes?: string;
  case_id?: string;
  client_id?: string;
  lawyer_id: string;
  created_at: string;
}

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  fetchAppointments: () => Promise<void>;
  addAppointment: (data: Omit<Appointment, 'id' | 'created_at' | 'lawyer_id'>) => Promise<void>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentState>((set) => ({
  appointments: [],
  loading: false,
  error: null,

  fetchAppointments: async () => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');

      const db = getDB();
      const appointments = db.prepare(`
        SELECT * FROM appointments 
        WHERE lawyer_id = ?
        ORDER BY date ASC
      `).all(user.id);

      set({ appointments, loading: false });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء جلب المواعيد', loading: false });
    }
  },

  addAppointment: async (data) => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');

      const db = getDB();
      const id = generateId();
      const now = new Date().toISOString();

      const newAppointment = {
        id,
        ...data,
        lawyer_id: user.id,
        created_at: now
      };

      db.prepare(`
        INSERT INTO appointments (
          id, title, type, date, location, notes, case_id, client_id, lawyer_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newAppointment.id,
        newAppointment.title,
        newAppointment.type,
        newAppointment.date,
        newAppointment.location,
        newAppointment.notes,
        newAppointment.case_id,
        newAppointment.client_id,
        newAppointment.lawyer_id,
        newAppointment.created_at
      );

      set(state => ({
        appointments: [...state.appointments, newAppointment].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
        loading: false
      }));
    } catch (error) {
      console.error('Error adding appointment:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء إضافة الموعد', loading: false });
    }
  },

  updateAppointment: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');

      const db = getDB();
      db.prepare(`
        UPDATE appointments 
        SET title = COALESCE(?, title),
            type = COALESCE(?, type),
            date = COALESCE(?, date),
            location = COALESCE(?, location),
            notes = COALESCE(?, notes),
            case_id = COALESCE(?, case_id),
            client_id = COALESCE(?, client_id)
        WHERE id = ? AND lawyer_id = ?
      `).run(
        data.title,
        data.type,
        data.date,
        data.location,
        data.notes,
        data.case_id,
        data.client_id,
        id,
        user.id
      );

      const updatedAppointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);

      set(state => ({
        appointments: state.appointments.map(a => a.id === id ? updatedAppointment : a)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating appointment:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء تحديث الموعد', loading: false });
    }
  },

  deleteAppointment: async (id) => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');

      const db = getDB();
      db.prepare('DELETE FROM appointments WHERE id = ? AND lawyer_id = ?').run(id, user.id);

      set(state => ({
        appointments: state.appointments.filter(a => a.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء حذف الموعد', loading: false });
    }
  }
}));