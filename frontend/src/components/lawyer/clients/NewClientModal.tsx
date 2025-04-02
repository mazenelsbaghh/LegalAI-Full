import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { useClientStore } from '../../../store/clientStore';

interface NewClientModalProps {
  onClose: () => void;
}

export default function NewClientModal({ onClose }: NewClientModalProps) {
  const { addClient, loading, error } = useClientStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    type: 'individual' as const,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addClient({
        name: formData.name,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        type: formData.type
      });
      onClose();
    } catch (err) {
      console.error('Error adding client:', err);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-br from-dark-900 to-dark-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl border border-gold-500/20"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gold-500/20">
              <h2 className="text-2xl font-bold text-gold-500">إضافة عميل جديد</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gold-500/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gold-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gold-500 mb-2">
                    نوع العميل
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="clientType"
                        value="individual"
                        checked={formData.type === 'individual'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'individual' | 'company' })}
                        className="ml-2"
                      />
                      <span className="text-gold-300">فرد</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="clientType"
                        value="company"
                        checked={formData.type === 'company'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'individual' | 'company' })}
                        className="ml-2"
                      />
                      <span className="text-gold-300">شركة</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gold-500 mb-2">
                    {formData.type === 'individual' ? 'الاسم' : 'اسم الشركة'}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gold-500 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gold-500 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gold-500 mb-2">
                    العنوان
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gold-500 mb-2">
                  ملاحظات
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-dark-700/50 hover:bg-dark-600/50 rounded-lg text-white font-bold transition-colors"
                  disabled={loading}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gold-500 rounded-lg text-dark-900 font-bold hover:bg-gold-600 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'جاري الإضافة...' : 'إضافة العميل'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}