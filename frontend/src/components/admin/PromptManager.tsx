import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash, Save, X, Star, AlertTriangle } from 'lucide-react';
import { usePromptStore } from '../../store/promptStore';
import { toast } from 'react-hot-toast';

interface PromptFormData {
  content: string;
  is_default: boolean;
}

const MAX_CONTENT_LENGTH = 1000;

export default function PromptManager() {
  const { prompts, loading, error, fetchPrompts, addPrompt, updatePrompt, deletePrompt, setDefaultPrompt } = usePromptStore();
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<PromptFormData>({
    content: '',
    is_default: true
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const validateForm = (data: PromptFormData) => {
    const errors: Record<string, string> = {};

    if (!data.content.trim()) {
      errors.content = 'محتوى القالب مطلوب';
    } else if (data.content.length > MAX_CONTENT_LENGTH) {
      errors.content = `المحتوى يجب أن لا يتجاوز ${MAX_CONTENT_LENGTH} حرف`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }

    try {
      if (editingPromptId) {
        await updatePrompt(editingPromptId, formData);
        toast.success('تم تحديث القالب بنجاح');
      } else {
        await addPrompt(formData);
        toast.success('تم إضافة القالب بنجاح');
      }
      
      setFormData({ content: '', is_default: true });
      setEditingPromptId(null);
      setIsAddingNew(false);
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ القالب');
    }
  };

  const handleEdit = (prompt: typeof prompts[0]) => {
    setFormData({
      content: prompt.content,
      is_default: prompt.is_default
    });
    setEditingPromptId(prompt.id);
    setIsAddingNew(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القالب؟')) {
      try {
        await deletePrompt(id);
        toast.success('تم حذف القالب بنجاح');
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف القالب');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">إدارة القوالب</h2>
        {!isAddingNew && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddingNew(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 rounded-lg text-dark-900 font-bold"
          >
            <Plus className="w-5 h-5 ml-2" />
            قالب جديد
          </motion.button>
        )}
      </div>

      {/* Form */}
      {isAddingNew && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800/50 backdrop-blur-lg rounded-xl p-6 border border-gold-500/20"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gold-400 mb-2">
                محتوى القالب
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className={`w-full px-4 py-2 bg-dark-700/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                  validationErrors.content ? 'border-red-500' : 'border-gold-500/20'
                }`}
                placeholder="اكتب تعليمات القالب هنا..."
              />
              {validationErrors.content && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.content}</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingPromptId(null);
                  setFormData({ content: '', is_default: true });
                }}
                className="px-4 py-2 bg-dark-700/50 hover:bg-dark-600/50 rounded-lg text-white transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-gold-500 hover:bg-gold-600 rounded-lg text-dark-900 font-bold transition-colors"
              >
                <Save className="w-4 h-4 ml-2" />
                {editingPromptId ? 'تحديث القالب' : 'إضافة القالب'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 text-red-400 rounded-lg">
          <AlertTriangle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Prompts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-400 py-8">جاري التحميل...</div>
        ) : prompts.length === 0 ? (
          <div className="text-center text-gray-400 py-8">لا توجد قوالب</div>
        ) : (
          prompts.map((prompt) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-800/50 backdrop-blur-lg rounded-xl p-6 border border-gold-500/20"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(prompt)}
                    className="p-2 hover:bg-dark-700/50 rounded-lg transition-colors text-gold-400"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(prompt.id)}
                    className="p-2 hover:bg-dark-700/50 rounded-lg transition-colors text-red-400"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{prompt.content}</p>
              <div className="mt-2 text-sm text-gray-400">
                تم التحديث: {new Date(prompt.updated_at).toLocaleString('ar-EG')}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}