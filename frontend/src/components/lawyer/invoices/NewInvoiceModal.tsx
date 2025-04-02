import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash } from 'lucide-react';

interface Service {
  description: string;
  amount: number;
}

interface NewInvoiceModalProps {
  onClose: () => void;
}

export default function NewInvoiceModal({ onClose }: NewInvoiceModalProps) {
  const [formData, setFormData] = useState({
    client: '',
    dueDate: '',
    services: [{ description: '', amount: 0 }] as Service[]
  });

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { description: '', amount: 0 }]
    });
  };

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index)
    });
  };

  const updateService = (index: number, field: keyof Service, value: string | number) => {
    const newServices = [...formData.services];
    newServices[index] = {
      ...newServices[index],
      [field]: value
    };
    setFormData({ ...formData, services: newServices });
  };

  const totalAmount = formData.services.reduce((sum, service) => sum + service.amount, 0);

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
            className="bg-gray-900 rounded-2xl w-full max-w-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">إنشاء فاتورة جديدة</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    العميل
                  </label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    تاريخ الاستحقاق
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Services */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">الخدمات</h3>
                  <button
                    type="button"
                    onClick={addService}
                    className="flex items-center text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    إضافة خدمة
                  </button>
                </div>

                {formData.services.map((service, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4">
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={service.description}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                        placeholder="وصف الخدمة"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={service.amount}
                        onChange={(e) => updateService(index, 'amount', parseFloat(e.target.value))}
                        placeholder="المبلغ"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        disabled={formData.services.length === 1}
                      >
                        <Trash className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end border-t border-white/10 pt-4">
                  <div className="text-lg">
                    <span className="text-gray-400">الإجمالي:</span>
                    <span className="text-white font-bold mr-2">{totalAmount} ج.م</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-bold hover:from-indigo-500 hover:to-purple-500 transition-colors"
                >
                  إنشاء الفاتورة
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}