import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import testUsers from '../../data/test-users.json';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      const user = useAuthStore.getState().user;
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/chat');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('خطأ في تسجيل الدخول. يرجى التحقق من بياناتك.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = (testUser: typeof testUsers.users[0]) => {
    setEmail(testUser.email);
    setPassword(testUser.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-indigo-900 to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">تسجيل الدخول</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              required
              disabled={loading}
              placeholder="lawyer@example.com"
            />
          </div>

          <div>
            <label className="block text-white mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              required
              disabled={loading}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'جاري تسجيل الدخول...' : 'دخول'}
          </motion.button>

          <div className="text-center">
            <p className="text-gray-400 mb-4">حسابات تجريبية:</p>
            <div className="space-y-2">
              {testUsers.users.map((user, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTestLogin(user)}
                  type="button"
                  className="w-full py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-all"
                >
                  {user.role === 'lawyer' ? 'حساب محامي' : 'حساب مشرف'}
                </motion.button>
              ))}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}