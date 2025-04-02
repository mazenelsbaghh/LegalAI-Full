import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ThumbsUp, ThumbsDown, Save, Brain, MessageSquare } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { usePromptStore } from '../../store/promptStore';
import { toast } from 'react-hot-toast';

interface TrainingFeedback {
  messageId: string;
  isCorrect: boolean;
  correction?: string;
}

export default function TrainingChat() {
  const { messages, loading, sendMessage, fetchMessages, clearMessages, aiConfig } = useChatStore();
  const { prompts } = usePromptStore();
  
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState<Record<string, TrainingFeedback>>({});
  const [correction, setCorrection] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Enable training mode
    useChatStore.setState({ trainingMode: true });
    fetchMessages();
    return () => {
      // Disable training mode when component unmounts
      useChatStore.setState({ trainingMode: false });
    };
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setMessage('');
      await sendMessage(message);
    } catch (error) {
      if (error.code !== 'REQUEST_ABORTED') {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleFeedback = (messageId: string, isCorrect: boolean) => {
    // Save feedback to local database
    useChatStore.getState().saveFeedback(messageId, isCorrect);

    setFeedback(prev => ({
      ...prev,
      [messageId]: { messageId, isCorrect }
    }));

    if (isCorrect) {
      toast.success('تم حفظ الرد كبيانات تدريب صحيحة');
    } else {
      setEditingMessageId(messageId);
    }
  };

  const handleSaveCorrection = async (messageId: string) => {
    if (!correction.trim()) {
      toast.error('يرجى إدخال التصحيح');
      return;
    }

    // Save correction to local database
    useChatStore.getState().saveFeedback(messageId, false, correction);

    setFeedback(prev => ({
      ...prev,
      [messageId]: { 
        messageId, 
        isCorrect: false,
        correction 
      }
    }));

    setEditingMessageId(null);
    setCorrection('');
    toast.success('تم حفظ التصحيح كبيانات تدريب');
  };

  const handleClearChat = async () => {
    try {
      await clearMessages();
      setFeedback({});
      toast.success('تم مسح المحادثة بنجاح');
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error('حدث خطأ أثناء مسح المحادثة');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-radial">
      {/* Header */}
      <div className="bg-dark-800/50 backdrop-blur-lg border-b border-gold-500/20 p-4">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-gold-500" />
          <h2 className="text-xl font-bold text-gold-500">تدريب ai agent</h2>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="space-y-2 max-w-[80%]">
              <div
                className={`p-4 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-gold-500 text-dark-900'
                    : msg.error
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-dark-800/50 backdrop-blur-lg border border-gold-500/20 text-white'
                }`}
              >
                {msg.content}
              </div>

              {/* Feedback Controls for AI Responses */}
              {msg.sender === 'ai' && !msg.error && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFeedback(msg.id, true)}
                    className={`p-2 rounded-lg transition-colors ${
                      msg.feedback?.is_correct
                        ? 'bg-green-500/20 text-green-400'
                        : 'hover:bg-dark-700/50 text-gray-400'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, false)}
                    className={`p-2 rounded-lg transition-colors ${
                      msg.feedback && !msg.feedback.is_correct
                        ? 'bg-red-500/20 text-red-400'
                        : 'hover:bg-dark-700/50 text-gray-400'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Correction Input */}
              {editingMessageId === msg.id && (
                <div className="space-y-2">
                  <textarea
                    value={correction}
                    onChange={(e) => setCorrection(e.target.value)}
                    placeholder="أدخل التصحيح هنا..."
                    rows={4}
                    className="w-full px-4 py-2 bg-dark-700/50 border border-gold-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingMessageId(null);
                        setCorrection('');
                      }}
                      className="px-4 py-2 bg-dark-700/50 hover:bg-dark-600/50 rounded-lg text-white transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => handleSaveCorrection(msg.id)}
                      className="flex items-center px-4 py-2 bg-gold-500 hover:bg-gold-600 rounded-lg text-dark-900 transition-colors"
                    >
                      <Save className="w-4 h-4 ml-2" />
                      حفظ التصحيح
                    </button>
                  </div>
                </div>
              )}

              {/* Saved Correction Display */}
              {msg.feedback?.correction && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
                  <p className="text-sm font-bold mb-1">التصحيح:</p>
                  {msg.feedback.correction}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-[80%] p-4 rounded-2xl bg-dark-800/50 backdrop-blur-lg border border-gold-500/20 text-white">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-dark-800/50 backdrop-blur-lg border-t border-gold-500/20"
      >
        <div className="flex gap-2">
          <input
            type="text"
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="اكتب سيناريو قانوني للتدريب..."
            className="flex-1 px-4 py-2 rounded-lg bg-dark-700/50 border border-gold-500/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
            disabled={loading || !aiConfig.apiKey}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-dark-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            type="submit"
            disabled={loading || !aiConfig.apiKey}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
        {!aiConfig.apiKey && (
          <p className="mt-2 text-sm text-red-400">
            يجب تكوين مفتاح GLM-4 API أولاً
          </p>
        )}
      </form>
    </div>
  );
}