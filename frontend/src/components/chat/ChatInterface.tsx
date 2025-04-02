import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Scale, FileText, AlertTriangle, CheckCircle, Trash, FileCode } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { toast } from 'react-hot-toast';
import { AIClient } from '../../lib/ai';

interface FormattedContent {
  type: 'title' | 'section' | 'text' | 'list' | 'article' | 'warning' | 'success';
  content: string;
  items?: string[];
}


import { Bot } from 'lucide-react';

export default function ChatInterface() {
  const [regenerateIndex, setRegenerateIndex] = useState<number | null>(null);

  const MessageBubble = ({ content, sender, index }: { content: string, sender: string, index: number }) => (
    <div className={\`my-2 p-3 rounded-lg max-w-[80%] text-sm whitespace-pre-wrap \${sender === 'user' ? 'bg-gray-200 self-end text-right ml-auto' : 'bg-blue-100 text-left'}\`}>
      {sender !== 'user' && <div className="flex items-center gap-1 text-xs text-blue-700 mb-1"><Bot size={14} /> الذكاء الاصطناعي</div>}
      <div>{content}</div>
      {sender !== 'user' && (
        <button
          onClick={() => setRegenerateIndex(index)}
          className="mt-2 text-xs text-indigo-600 hover:underline"
        >
          أعد توليد الرد
        </button>
      )}
    </div>
  );

  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem("geminiApiKey") || "";
  });

  useEffect(() => {
    localStorage.setItem("geminiApiKey", geminiApiKey);
  }, [geminiApiKey]);

  const [aiModel, setAiModel] = useState('glm-4');

  
  const { messages, loading, sendMessage, fetchMessages, clearMessages, addMessage } = useChatStore();

  const regenerateResponse = async (index: number) => {
    const originalMessage = messages[index - 1]; // نفترض أن الرد يأتي بعد السؤال مباشرة
    if (!originalMessage || originalMessage.sender !== 'user') return;

    setRegenerateIndex(null);
    setLoading(true);

    try {
      const reply = await import('../../lib/ai').then(mod => mod.sendToGemini(originalMessage.content));
      const regenerated = {
        id: Date.now().toString(),
        content: reply,
        sender: 'ai',
        created_at: new Date().toISOString()
      };
      addMessage(regenerated);
    } catch (err) {
      toast.error("فشل في توليد الرد مجددًا.");
    } finally {
      setLoading(false);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);


      <div className="mb-4">
        <label htmlFor="ai-model" className="text-sm font-medium text-gray-700">اختر نموذج الذكاء الاصطناعي</label>
        <select
          id="ai-model"
        />

      <div className="mb-4">
        <label htmlFor="gemini-key" className="text-sm font-medium text-gray-700">Gemini API Key</label>
        <input
          type="text"
          id="gemini-key"
          value={geminiApiKey}
          onChange={(e) => setGeminiApiKey(e.target.value)}
          placeholder="ادخل مفتاح Gemini هنا"
          className="mt-1 block w-full rounded-md border-dark-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

        <select
          value={aiModel}
          onChange={(e) => setAiModel(e.target.value)}
          className="mt-1 block w-full rounded-md border-dark-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="glm-4">GLM-4</option>
          <option value="gemini">Gemini 2.5</option>
        </select>
      </div>

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);


      <div className="mb-4">
        <label htmlFor="ai-model" className="text-sm font-medium text-gray-700">اختر نموذج الذكاء الاصطناعي</label>
        <select
          id="ai-model"
        />

      <div className="mb-4">
        <label htmlFor="gemini-key" className="text-sm font-medium text-gray-700">Gemini API Key</label>
        <input
          type="text"
          id="gemini-key"
          value={geminiApiKey}
          onChange={(e) => setGeminiApiKey(e.target.value)}
          placeholder="ادخل مفتاح Gemini هنا"
          className="mt-1 block w-full rounded-md border-dark-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

        <select
          value={aiModel}
          onChange={(e) => setAiModel(e.target.value)}
          className="mt-1 block w-full rounded-md border-dark-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="glm-4">GLM-4</option>
          <option value="gemini">Gemini 2.5</option>
        </select>
      </div>

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


      <div className="mb-4">
        <label htmlFor="ai-model" className="text-sm font-medium text-gray-700">اختر نموذج الذكاء الاصطناعي</label>
        <select
          id="ai-model"
        />

      <div className="mb-4">
        <label htmlFor="gemini-key" className="text-sm font-medium text-gray-700">Gemini API Key</label>
        <input
          type="text"
          id="gemini-key"
          value={geminiApiKey}
          onChange={(e) => setGeminiApiKey(e.target.value)}
          placeholder="ادخل مفتاح Gemini هنا"
          className="mt-1 block w-full rounded-md border-dark-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

        <select
          value={aiModel}
          onChange={(e) => setAiModel(e.target.value)}
          className="mt-1 block w-full rounded-md border-dark-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="glm-4">GLM-4</option>
          <option value="gemini">Gemini 2.5</option>
        </select>
      </div>

  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      // Combine template with message if selected
      const finalMessage = selectedTemplate 
        ? `${selectedTemplate}\n\nالمطلوب:\n${message}`
        : message;
        
      setMessage('');
      setSelectedTemplate(null);
      await sendMessage(finalMessage);
    } catch (error) {
      if (error.code !== 'REQUEST_ABORTED') {
        console.error('Error sending message:', error);
        toast.error(error.message || 'حدث خطأ أثناء معالجة الرسالة');
      }
    }
  };

  const handleClearChat = async () => {
    try {
      await clearMessages();
      toast.success('تم مسح المحادثة بنجاح');
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error('حدث خطأ أثناء مسح المحادثة');
    }
  };

  const renderFormattedContent = (content: string, formattedContent?: FormattedContent[]) => {
    if (!formattedContent) {
      // Try to detect and format legal content
      if (content.includes('مذكرة') || content.includes('دفوع') || content.includes('المادة')) {
        const sections = content.split('\n\n');
        return (
          <div className="space-y-4">
            {sections.map((section, index) => {
              if (section.startsWith('المادة')) {
                return (
                  <div key={index} className="flex items-start gap-2 text-gold-400">
                    <Scale className="w-5 h-5 mt-1" />
                    <p className="font-bold">{section}</p>
                  </div>
                );
              }
              if (section.includes(':')) {
                const [title, ...content] = section.split(':');
                return (
                  <div key={index}>
                    <h3 className="font-bold text-lg mb-2">{title}:</h3>
                    <p>{content.join(':')}</p>
                  </div>
                );
              }
              return <p key={index}>{section}</p>;
            })}
          </div>
        );
      }
      return <p>{content}</p>;
    }

    return (
      <div className="space-y-4">
        {formattedContent.map((block, index) => {
          switch (block.type) {
            case 'title':
              return (
                <h2 key={index} className="text-xl font-bold">
                  {block.content}
                </h2>
              );
            case 'section':
              return (
                <h3 key={index} className="text-lg font-bold mb-2">
                  {block.content}
                </h3>
              );
            case 'article':
              return (
                <div key={index} className="flex items-start gap-2 text-gold-400">
                  <Scale className="w-5 h-5 mt-1" />
                  <p className="font-bold">{block.content}</p>
                </div>
              );
            case 'list':
              return (
                <ul key={index} className="space-y-2">
                  {block.items?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-1 text-gold-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              );
            case 'warning':
              return (
                <div key={index} className="flex items-start gap-2 text-red-400">
                  <AlertTriangle className="w-5 h-5 mt-1" />
                  <p>{block.content}</p>
                </div>
              );
            case 'success':
              return (
                <div key={index} className="flex items-start gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5 mt-1" />
                  <p>{block.content}</p>
                </div>
              );
            default:
              return <p key={index}>{block.content}</p>;
          }
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-radial">
      {/* Messages Container */}
      <div className="relative flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 left-4 p-2 bg-dark-800/50 backdrop-blur-lg border border-gold-500/20 rounded-lg hover:bg-dark-700/50 transition-colors"
            onClick={handleClearChat}
          >
            <Trash className="w-5 h-5 text-red-400" />
          </motion.button>
        )}
        
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-gold-500 text-dark-900'
                  : msg.error
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-dark-800/50 backdrop-blur-lg border border-gold-500/20 text-white'
              }`}
            >
              {renderFormattedContent(msg.content, msg.formattedContent)}
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
        className="p-4 bg-dark-800/50 backdrop-blur-lg border-t border-gold-500/20 space-y-4"
      >
        {/* Template Selection */}
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(AIClient.Templates).map(([key, template]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedTemplate(template)}
              className={`flex items-center gap-2 p-3 rounded-lg transition-all ${
                selectedTemplate === template
                  ? 'bg-gold-500 text-dark-900'
                  : 'bg-dark-700/50 text-gold-400 hover:bg-dark-600/50'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span className="text-sm">
                {key === 'DEFENSE_MEMO' ? 'مذكرة دفاع' :
                 key === 'LEGAL_ANALYSIS' ? 'تحليل قانوني' :
                 key === 'CONTRACT_DRAFTING' ? 'صياغة عقد' :
                 'صحيفة دعوى'}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={selectedTemplate 
              ? "اكتب تفاصيل المطلوب هنا..."
              : "اكتب سؤالك القانوني أو اختر قالباً من الأعلى..."}
            className="flex-1 px-4 py-2 rounded-lg bg-dark-700/50 border border-gold-500/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
            disabled={loading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-dark-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            type="submit"
            disabled={loading}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}