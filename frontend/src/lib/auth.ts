import { hashPassword, verifyPassword } from '../utils/crypto';
import { getDB, getUserByEmail, type Profile } from './db';
import { generateId } from '../utils/id';

// Auth functions
export const auth = {
  async signIn(email: string, password: string) {
    if (!email || !password) {
      throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
    }

    const user = await getUserByEmail(email);
    if (!user) {
      throw new Error('بيانات الدخول غير صحيحة');
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
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

    return { user: session };
  },

  async signUp(email: string, password: string, userData: Omit<Profile, 'id' | 'created_at' | 'password_hash'>) {
    try {
      if (!email || !password) {
        throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان');
      }

      const db = await getDB();

      // Check if user exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        throw new Error('البريد الإلكتروني مستخدم بالفعل');
      }

      // Create new user
      const id = generateId();
      const passwordHash = await hashPassword(password);
      const now = new Date().toISOString();

      const profile = {
        id,
        email,
        role: userData.role,
        full_name: userData.full_name || null,
        phone: userData.phone || null,
        address: userData.address || null,
        license_number: userData.license_number || null,
        specialization: userData.specialization || null,
        password_hash: passwordHash,
        created_at: now
      };

      db.profiles.set(id, profile);

      return { profile };

    } catch (error) {
      console.error('Signup error:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('حدث خطأ أثناء التسجيل');
    }
  },

  async signOut() {
    localStorage.removeItem('auth_user');
  },

  async getProfile() {
    const savedUser = localStorage.getItem('auth_user');
    if (!savedUser) return null;

    const user = JSON.parse(savedUser);
    const db = await getDB();
    
    const profile = db.profiles.get(user.id);
    if (!profile) {
      localStorage.removeItem('auth_user');
      return null;
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name
    };
  }
};