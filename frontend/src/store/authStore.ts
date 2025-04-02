import { create } from 'zustand';
import { getUserByEmail, createUser, getDB } from '../lib/db';
import { hashPassword, verifyPassword } from '../utils/crypto';
import type { Profile } from '../lib/database.types';

type User = Profile;

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signUpAdmin: (data: SignUpAdminData) => Promise<void>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
}

type SignUpData = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
  licenseNumber?: string;
  specialization?: string;
};

type SignUpAdminData = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      if (!email || !password) {
        throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان');
      }

      const user = await getUserByEmail(email);
      if (!user) {
        throw new Error('بيانات الدخول غير صحيحة');
      }

      // For test users, compare passwords directly
      if (user.password_hash !== password) {
        throw new Error('بيانات الدخول غير صحيحة');
      }

      // Store session
      const session = {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      };
      localStorage.setItem('auth_user', JSON.stringify(session));

      set({ user: session, loading: false, error: null });
    } catch (error) {
      console.error('Login error:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'حدث خطأ أثناء تسجيل الدخول',
        user: null
      });
      throw error;
    }
  },

  signUp: async (data: SignUpData) => {
    set({ loading: true, error: null });
    try {
      // Check if user exists
      const existingUser = await getUserByEmail(data.email);
      if (existingUser) {
        throw new Error('البريد الإلكتروني مستخدم بالفعل');
      }

      // Create new user
      const passwordHash = await hashPassword(data.password);
      const user = await createUser({
        email: data.email,
        role: 'lawyer',
        full_name: data.fullName,
        phone: data.phone,
        address: data.address,
        license_number: data.licenseNumber,
        specialization: data.specialization,
        password_hash: passwordHash
      });

      set({ user, loading: false, error: null });
    } catch (error) {
      console.error('Signup error:', error);
      set({
        loading: false,
        error: 'حدث خطأ أثناء التسجيل'
      });
    }
  },

  signUpAdmin: async (data: SignUpAdminData) => {
    set({ loading: true, error: null });
    try {
      // Validate required fields
      if (!data.email || !data.password) {
        throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      }

      if (!data.email || !data.password) {
        throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان');
      }

      // Check if user exists
      const existingUser = await getUserByEmail(data.email);
      if (existingUser) {
        throw new Error('البريد الإلكتروني مستخدم بالفعل');
      }

      // Create new user
      const passwordHash = await hashPassword(data.password);
      const user = await createUser({
        email: data.email,
        role: 'admin',
        full_name: data.fullName,
        phone: data.phone || null,
        address: data.address || null,
        password_hash: passwordHash
      });

      set({ user, loading: false, error: null });
    } catch (error) {
      console.error('Admin signup error:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'حدث خطأ أثناء تسجيل المشرف'
      });
    }
  },

  signOut: async () => {
    try {
      localStorage.removeItem('auth_user');
      set({ user: null, loading: false, error: null });
    } catch (error) {
      console.error('Signout error:', error);
      set({ error: 'حدث خطأ أثناء تسجيل الخروج' });
    }
  },

  checkUser: async () => {
    try {
      const savedUser = localStorage.getItem('auth_user');
      if (!savedUser) {
        set({ user: null, loading: false, error: null });
        return;
      }

      const user = JSON.parse(savedUser);
      const profile = await getUserByEmail(user.email);
      if (!profile) {
        localStorage.removeItem('auth_user');
        set({ user: null, loading: false, error: null });
        return;
      }

      set({ user: profile, loading: false, error: null });
    } catch (error) {
      console.error('Check user error:', error);
      set({ user: null, loading: false, error: null });
    }
  }
}));