import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText,
  Brain,
  Upload,
  Download
} from 'lucide-react';

interface NewDocumentModalProps {
  onClose: () => void;
}

export default function NewDocumentModal({ onClose }: NewDocumentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'defense',
    content: '',
    case: '',
    client: '',
    status: 'draft'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gradient-to-br from-dark-900 to-dark-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-xl border border-gold-500/20"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gold-500/20">
            <h2 className="text-2xl font-bold text-gold-500">مستند جديد</h2>
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
                  عنوان المستند
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gold-500 mb-2">
                  نوع المستند
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  required
                >
                  <option value="defense" className="bg-dark-900">مذكرة دفاع</option>
                  <option value="contract" className="bg-dark-900">عقد</option>
                  <option value="claim" className="bg-dark-900">صحيفة دعوى</option>
                  <option value="power_of_attorney" className="bg-dark-900">توكيل قانوني</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gold-500 mb-2">
                  رقم القضية
                </label>
                <input
                  type="text"
                  value={formData.case}
                  onChange={(e) => setFormData({ ...formData, case: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  required
                />
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

            <div>
              <label className="block text-sm font-bold text-gold-500 mb-2">
                محتوى المستند
              </label>
              <div className="bg-dark-700/50 rounded-lg p-4 border border-gold-500/20">
                <div className="flex gap-2 mb-4 border-b border-gold-500/20 pb-4">
                  <button 
                    type="button"
                    className="p-2 hover:bg-dark-600/50 rounded-lg transition-colors"
                  >
                    <Brain className="w-4 h-4 text-gold-400" />
                  </button>
                  <button 
                    type="button"
                    className="p-2 hover:bg-dark-600/50 rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4 text-gold-400" />
                  </button>
                  <button 
                    type="button"
                    className="p-2 hover:bg-dark-600/50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 text-gold-400" />
                  </button>
                </div>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-2 bg-dark-800/50 border border-gold-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 font-arabic"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gold-500 mb-2">
                المرفقات
              </label>
              <div className="border-2 border-dashed border-gold-500/20 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 text-gold-400 mx-auto mb-4" />
                <p className="text-sm text-gold-400">
                  اسحب وأفلت الملفات هنا أو
                  <button 
                    type="button"
                    className="text-gold-500 hover:text-gold-400 mr-1"
                  >
                    تصفح من جهازك
                  </button>
                </p>
              </div>
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
                حفظ المستند
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}