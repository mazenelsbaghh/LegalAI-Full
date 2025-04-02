import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users } from 'lucide-react';
import { useCaseStore } from '../../../store/caseStore';
import { useClientStore } from '../../../store/clientStore';

interface NewCaseModalProps {
  onClose: () => void;
}

export default function NewCaseModal({ onClose }: NewCaseModalProps) {
  const { addCase, loading, error } = useCaseStore();
  const { clients, fetchClients } = useClientStore();
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    court: '',
    client_id: '',
    status: 'open' as const,
  });
  

  const [lawyers, setLawyers] = useState<{ id: string, name: string }[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('lawyers');
    if (stored) {
      setLawyers(JSON.parse(stored));
    }
  }, []);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'عنوان القضية مطلوب';
    }
    
    if (!formData.type) {
      errors.type = 'نوع القضية مطلوب';
    }
    
    if (!formData.court.trim()) {
      errors.court = 'اسم المحكمة مطلوب';
    }

    if (!formData.client_id) {
      errors.client_id = 'العميل مطلوب';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await addCase(formData);
      onClose();
    } catch (error) {
      console.error('خطأ في إضافة القضية:', error);
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
            <div className="flex justify-between items-center p-6 border-b border-gold-500/20">
              <h2 className="text-2xl font-bold text-gold-500">إضافة قضية جديدة</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gold-500/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gold-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gold-500 mb-2">
                    عنوان القضية
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (validationErrors.title) {
                        setValidationErrors({ ...validationErrors, title: '' });
                      }
                    }}
                    className={`w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                      validationErrors.title ? 'border-red-500' : 'border-white/10'
                    }`}
                    required
                  />
                  {validationErrors.title && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gold-500 mb-2">
                    نوع القضية
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      setFormData({ ...formData, type: e.target.value });
                      if (validationErrors.type) {
                        setValidationErrors({ ...validationErrors, type: '' });
                      }
                    }}
                    className={`w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                      validationErrors.type ? 'border-red-500' : 'border-white/10'
                    }`}
                    required
                  >
                    <option value="" className="bg-dark-900 text-white">اختر النوع</option>
                    <option value="مدني" className="bg-dark-900 text-white">مدني</option>
                    <option value="تجاري" className="bg-dark-900 text-white">تجاري</option>
                    <option value="جنائي" className="bg-dark-900 text-white">جنائي</option>
                    <option value="عمالي" className="bg-dark-900 text-white">عمالي</option>
                  </select>
                  {validationErrors.type && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.type}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gold-500 mb-2">
                    المحكمة
                  </label>
                  <input
                    type="text"
                    value={formData.court}
                    onChange={(e) => {
                      setFormData({ ...formData, court: e.target.value });
                      if (validationErrors.court) {
                        setValidationErrors({ ...validationErrors, court: '' });
                      }
                    }}
                    className={`w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                      validationErrors.court ? 'border-red-500' : 'border-white/10'
                    }`}
                    required
                  />
                  {validationErrors.court && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.court}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gold-500 mb-2">
                    العميل
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => {
                      setFormData({ ...formData, client_id: e.target.value });
                      if (validationErrors.client_id) {
                        setValidationErrors({ ...validationErrors, client_id: '' });
                      }
                    }}
                    className={`w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                      validationErrors.client_id ? 'border-red-500' : 'border-white/10'
                    }`}
                    required
                  >
                    <option value="" className="bg-dark-900 text-white">اختر العميل</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id} className="bg-dark-900 text-white">
                        {client.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.client_id && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.client_id}</p>
                  )}
                </div>
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
                  {loading ? 'جاري الإضافة...' : 'إضافة القضية'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}