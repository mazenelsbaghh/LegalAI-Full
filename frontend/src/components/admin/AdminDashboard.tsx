import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FileText, Calendar, Brain, AlertTriangle, LogOut, Clock, Save, Trash, Edit, Plus, Check, FileCode } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { usePromptStore } from '../../store/promptStore';
import { useAuthStore } from '../../store/authStore';
import { AIClient } from '../../lib/ai';
import TrainingChat from './TrainingChat';
import PromptManager from './PromptManager';
import LawyerManagement from './LawyerManagement';
import AdminStats from './AdminStats';

const MemoizedTrainingChat = React.memo(TrainingChat);
const MemoizedPromptManager = React.memo(PromptManager);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, signOut, checkUser } = useAuthStore();
  const chatStore = useChatStore();
  const { predefinedResponses, addPredefinedResponse, updatePredefinedResponse, removePredefinedResponse, aiConfig } = useChatStore();
  
  const [editingResponse, setEditingResponse] = useState<string | null>(null);
  const { prompts, loading: promptsLoading, fetchPrompts, addPrompt, updatePrompt, deletePrompt, setDefaultPrompt } = usePromptStore();
  const [newPrompt, setNewPrompt] = useState({
    label: '',
    content: '',
    is_default: false
  });
  const [newResponse, setNewResponse] = useState({
    response: '',
    processingTime: 2,
    validUntil: ''
  });

  // Memoize expensive computations
  const filteredResponses = useMemo(() => 
    predefinedResponses.filter(r => !r.validUntil || new Date(r.validUntil) > new Date()),
    [predefinedResponses]
  );

  useEffect(() => {
    // Initialize AI client with fixed API key
    const client = new AIClient({
      apiKey: AIClient.FIXED_API_KEY,
      model: aiConfig.model,
      timeout: aiConfig.timeout,
      maxRetries: aiConfig.maxRetries
    });
    useChatStore.setState({ aiClient: client });
  }, [aiConfig.model, aiConfig.timeout, aiConfig.maxRetries]);

  useEffect(() => {
    checkUser().then(() => {
      const user = useAuthStore.getState().user;
      if (!user) {
        navigate('/login');
      } else if (user.role !== 'admin') {
        navigate('/lawyer');
      }
    });
  }, [navigate, checkUser]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAddResponse = () => {
    if (newResponse.response.trim()) {
      addPredefinedResponse({
        response: newResponse.response.trim(),
        processingTime: newResponse.processingTime,
        validUntil: newResponse.validUntil || undefined
      });
      setNewResponse({ response: '', processingTime: 2, validUntil: '' });
    }
  };

  const handleUpdateResponse = (id: string) => {
    const response = predefinedResponses.find(r => r.id === id);
    if (response) {
      updatePredefinedResponse(id, {
        response: response.response.trim(),
        processingTime: response.processingTime,
        validUntil: response.validUntil
      });
      setEditingResponse(null);
    }
  };

  const handleAddPrompt = () => {
    if (!newPrompt.label.trim() || !newPrompt.content.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    addPrompt(newPrompt);
    setNewPrompt({ label: '', content: '', is_default: false });
  };

  return (
    <div className='my-4'><AdminStats /></div>
    <div className="space-y-8">
      <LawyerManagement />
    </div>

    <div className="min-h-screen bg-gradient-radial p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gold-500/20"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gold-500">لوحة تحكم المشرف</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 btn-dark rounded-lg"
            >
              <LogOut className="w-5 h-5 ml-2" />
              تسجيل الخروج
            </motion.button>
          </div>

          {/* AI Mode Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gold-500 mb-4">الإعدادات</h3>
            <div className="flex gap-4">
              <button
                onClick={() => chatStore.setAiMode('predefined')}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  chatStore.aiMode === 'predefined'
                    ? 'btn-gold'
                    : 'btn-dark'
                }`}
              >
                إعدادات عامة
              </button>
              <button
                onClick={() => chatStore.setAiMode('glm4')}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  chatStore.aiMode === 'glm4'
                    ? 'btn-gold'
                    : 'btn-dark'
                }`}
              >
                إعدادات المساعد الذكي
              </button>
            </div>
          </div>

          {/* Prompt Manager */}
          {chatStore.aiMode === 'glm4' && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gold-500 mb-4 flex items-center gap-2">
                <FileCode className="w-6 h-6" />
                قوالب المساعد الذكي
              </h3>
              <div className="bg-dark-700/50 p-6 rounded-xl">
                <MemoizedPromptManager />
              </div>
            </div>
          )}

          {/* API Key Configuration */}
          {chatStore.aiMode === 'glm4' && (
            <div className="bg-dark-700/50 p-6 rounded-xl space-y-4 mb-8">
              <h4 className="text-lg font-semibold text-gold-500">حالة الاتصال</h4>
              <p className="text-sm text-gold-400">
                تم تكوين مفتاح API تلقائياً
              </p>
            </div>
          )}
          
          {/* AI Configuration */}
          {chatStore.aiMode === 'glm4' && (
            <div className="bg-dark-700/50 p-6 rounded-xl space-y-4 mt-4">
              <h4 className="text-lg font-semibold text-gold-500 mb-4">إعدادات المساعد الذكي</h4>
              
              <div>
                <label className="block text-sm font-medium text-gold-400 mb-2">
                  نموذج المساعد الذكي
                </label>
                <select
                  value={chatStore.aiConfig.model}
                  onChange={(e) => chatStore.updateAIConfig({ model: e.target.value })}
                  className="w-full px-4 py-2 input-dark rounded-lg"
                >
                  <option value={AIClient.Models.GLM_4}>GLM-4 (الأساسي)</option>
                  <option value={AIClient.Models.GLM_4_PLUS}>GLM-4 Plus (متقدم)</option>
                  <option value={AIClient.Models.GLM_4_0520}>GLM-4 0520 (محدث)</option>
                  <option value={AIClient.Models.GLM_4_AIR}>GLM-4 Air (خفيف)</option>
                  <option value={AIClient.Models.GLM_4_AIRX}>GLM-4 AirX (خفيف+)</option>
                  <option value={AIClient.Models.GLM_4_LONG}>GLM-4 Long (سياق طويل)</option>
                  <option value={AIClient.Models.GLM_4_FLASH}>GLM-4 Flash (سريع)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gold-400 mb-2">
                  رسالة النظام
                </label>
                <textarea
                  value={chatStore.aiConfig.systemPrompt}
                  onChange={(e) => chatStore.updateAIConfig({ systemPrompt: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 input-dark rounded-lg"
                  placeholder="رسالة النظام التي تحدد شخصية المساعد القانوني"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gold-400 mb-2">
                    مهلة الانتظار (بالمللي ثانية)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={chatStore.aiConfig.timeout}
                    onChange={(e) => chatStore.updateAIConfig({ timeout: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 input-dark rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold-400 mb-2">
                    عدد المحاولات
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={chatStore.aiConfig.maxRetries}
                    onChange={(e) => chatStore.updateAIConfig({ maxRetries: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 input-dark rounded-lg"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gold-400 mb-2">
                    درجة الحرارة
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={chatStore.aiConfig.temperature}
                    onChange={(e) => chatStore.updateAIConfig({ temperature: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 input-dark rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold-400 mb-2">
                    Top P
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={chatStore.aiConfig.topP}
                    onChange={(e) => chatStore.updateAIConfig({ topP: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 input-dark rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold-400 mb-2">
                    أقصى عدد للرموز
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="4096"
                    step="1"
                    value={chatStore.aiConfig.maxTokens}
                    onChange={(e) => chatStore.updateAIConfig({ maxTokens: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 input-dark rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Training Chat */}
          {chatStore.aiMode === 'glm4' && chatStore.aiConfig.apiKey && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gold-500 mb-4">تدريب ai agent</h3>
              <div className="bg-dark-700/50 rounded-xl overflow-hidden" style={{ height: '600px' }}>
                <MemoizedTrainingChat />
              </div>
            </div>
          )}

          {/* Predefined Responses Management */}
          {chatStore.aiMode === 'predefined' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gold-500">الإعدادات العامة</h3>
              </div>

              {/* Add New Response */}
              <div className="bg-dark-700/50 p-6 rounded-xl space-y-4">
                <h4 className="text-lg font-semibold text-gold-500 mb-4">إضافة رد تلقائي</h4>
                <div>
                  <label className="block text-sm font-medium text-gold-400 mb-2">
                    الرد
                  </label>
                  <textarea
                    value={newResponse.response}
                    onChange={(e) => setNewResponse({ ...newResponse, response: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 input-dark rounded-lg"
                    placeholder="اكتب الرد هنا..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gold-400 mb-2">
                      مدة المعالجة (بالثواني)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={newResponse.processingTime}
                      onChange={(e) => setNewResponse({ ...newResponse, processingTime: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 input-dark rounded-lg"
                      placeholder="مثال: 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gold-400 mb-2">
                      صالح حتى (اختياري)
                    </label>
                    <input
                      type="datetime-local"
                      value={newResponse.validUntil}
                      onChange={(e) => setNewResponse({ ...newResponse, validUntil: e.target.value })}
                      className="w-full px-4 py-2 input-dark rounded-lg"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddResponse}
                  className="flex items-center px-4 py-2 btn-gold rounded-lg"
                >
                  إضافة رد
                </button>
              </div>

              {/* Existing Responses */}
              <div className="space-y-4">
                {predefinedResponses.map((response) => (
                  <div
                    key={response.id}
                    className="bg-dark-700/50 p-6 rounded-xl"
                  >
                    {editingResponse === response.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gold-400 mb-2">
                            الرد
                          </label>
                          <textarea
                            value={response.response}
                            onChange={(e) => updatePredefinedResponse(response.id, { response: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 input-dark rounded-lg"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gold-400 mb-2">
                              مدة المعالجة (بالثواني)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={response.processingTime}
                              onChange={(e) => updatePredefinedResponse(response.id, { processingTime: parseInt(e.target.value) || 0 })}
                              className="w-full px-4 py-2 input-dark rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gold-400 mb-2">
                              صالح حتى (اختياري)
                            </label>
                            <input
                              type="datetime-local"
                              value={response.validUntil}
                              onChange={(e) => updatePredefinedResponse(response.id, { validUntil: e.target.value })}
                              className="w-full px-4 py-2 input-dark rounded-lg"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingResponse(null)}
                            className="px-4 py-2 btn-dark rounded-lg"
                          >
                            إلغاء
                          </button>
                          <button
                            onClick={() => handleUpdateResponse(response.id)}
                            className="flex items-center px-4 py-2 btn-gold rounded-lg"
                          >
                            <Save className="w-4 h-4 ml-2" />
                            حفظ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingResponse(response.id)}
                              className="p-2 hover:bg-dark-600/50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4 text-gold-400" />
                            </button>
                            <button
                              onClick={() => removePredefinedResponse(response.id)}
                              className="p-2 hover:bg-dark-600/50 rounded-lg transition-colors"
                            >
                              <Trash className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                        <p className="text-gold-100 whitespace-pre-wrap mb-4">
                          {response.response}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 ml-1" />
                            مدة المعالجة: {response.processingTime} ثواني
                          </div>
                          {response.validUntil && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 ml-1" />
                              صالح حتى: {new Date(response.validUntil).toLocaleString('ar-EG')}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}