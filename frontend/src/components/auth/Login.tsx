import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      }

      await signIn(email.trim(), password.trim());
      const user = useAuthStore.getState().user;
      if (user?.role === 'lawyer') {
        navigate('/lawyer');
      } else if (user?.role === 'admin') {
        navigate('/admin');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'حدث خطأ أثناء تسجيل الدخول. يرجى التحقق من بياناتك والمحاولة مرة أخرى.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-800/50 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md border border-gold-500/20"
      >
        <div className="flex items-center justify-center mb-8">
          <Scale className="h-12 w-12 text-gold-500" />
          <h2 className="text-3xl font-bold text-gold-500 mr-4">تسجيل الدخول</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gold-100 mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg input-dark"
              required
              disabled={loading}
              placeholder="lawyer@example.com"
            />
          </div>

          <div>
            <label className="block text-gold-100 mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg input-dark"
              required
              disabled={loading}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/10 text-red-400 p-4 rounded-lg text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 rounded-lg btn-gold ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'جاري تسجيل الدخول...' : 'دخول'}
          </motion.button>

          <div className="text-center mt-4">
            <Link
              to="/register"
              className="text-gold-400 hover:text-gold-300 transition-colors flex items-center justify-center gap-2"
            >
              <span>ليس لديك حساب؟ تسجيل محامي جديد</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}