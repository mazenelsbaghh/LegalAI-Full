import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, Users, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale'; 

interface NewAppointmentModalProps {
  selectedDate: Date;
  onClose: () => void;
}

export default function NewAppointmentModal({ selectedDate, onClose }: NewAppointmentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'court',
    date: format(selectedDate, 'yyyy-MM-dd'),
    time: '09:00',
    location: '',
    client: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onClose();
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
              <h2 className="text-2xl font-bold text-gold-500">إضافة موعد جديد</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gold-500/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gold-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gold-500 mb-2">
                  عنوان الموعد
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gold-500 mb-2">
                    نوع الموعد
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    required
                  >
                    <option value="court" className="bg-dark-900 text-white">جلسة محكمة</option>
                    <option value="meeting" className="bg-dark-900 text-white">اجتماع</option>
                    <option value="deadline" className="bg-dark-900 text-white">موعد نهائي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gold-500 mb-2">
                    العميل
                  </label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gold-500 mb-2">
                    التاريخ
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gold-500 mb-2">
                    الوقت
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gold-500 mb-2">
                  المكان
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  required
                />
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

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-dark-700/50 hover:bg-dark-600/50 rounded-lg text-white font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gold-500 rounded-lg text-dark-900 font-bold hover:bg-gold-600 transition-colors"
                >
                  إضافة الموعد
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}