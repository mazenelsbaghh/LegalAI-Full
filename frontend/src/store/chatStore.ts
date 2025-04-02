import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { getDB } from '../lib/db';
import { AIClient, FIXED_API_KEY } from '../lib/ai';
import { generateId } from '../utils/id';

// Load predefined responses from local storage
const loadPredefinedResponses = () => {
  try {
    const saved = localStorage.getItem('predefinedResponses');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading predefined responses:', error);
    return [];
  }
};

// Save predefined responses to local storage
const savePredefinedResponses = (responses: any[]) => {
  try {
    localStorage.setItem('predefinedResponses', JSON.stringify(responses));
  } catch (error) {
    console.error('Error saving predefined responses:', error);
  }
};

interface Message {
  id: string;
  user_id: string;
  content: string;
  sender: 'user' | 'ai';
  feedback?: {
    is_correct: boolean;
    correction?: string;
  };
  created_at: string;
  error?: boolean;
}

const DEFAULT_AI_CONFIG = {
  apiKey: FIXED_API_KEY,
  model: AIClient.Models.GLM_4_0520,
  systemPrompt: 'أنت مساعد قانوني ذكي يقدم استشارات قانونية دقيقة ومهنية.',
  timeout: 60000,
  maxRetries: 3,
  temperature: 0.7,
  topP: 0.7,
  maxTokens: 2048
};

interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  trainingMode: boolean;
  aiMode: 'predefined' | 'glm4';
  aiConfig: typeof DEFAULT_AI_CONFIG;
  predefinedResponses: {
    id: string;
    response: string;
    processingTime: number;
    validUntil?: string;
  }[];
  fetchMessages: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => Promise<void>;
  saveFeedback: (messageId: string, isCorrect: boolean, correction?: string) => Promise<void>;
  setAiMode: (mode: 'predefined' | 'glm4') => void;
  updateAIConfig: (config: Partial<typeof DEFAULT_AI_CONFIG>) => void;
  addPredefinedResponse: (response: { response: string; processingTime: number; validUntil?: string }) => void;
  updatePredefinedResponse: (id: string, data: Partial<{ response: string; processingTime: number; validUntil?: string }>) => void;
  removePredefinedResponse: (id: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,
  error: null,
  trainingMode: false,
  aiMode: 'glm4',
  aiConfig: DEFAULT_AI_CONFIG,
  predefinedResponses: loadPredefinedResponses(),

  fetchMessages: async () => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');
      
      const db = await getDB();
      const messages = await db.get('messages', user.id) || [];

      set({ messages: messages || [], loading: false });

    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء جلب الرسائل', loading: false });
    }
  },

  sendMessage: async (content: string) => {
    set({ loading: true, error: null });
    try {
      const trimmedContent = content?.trim();
      if (!trimmedContent) {
        throw new Error('الرجاء إدخال رسالة');
      }

      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      const now = new Date().toISOString();
      const messageId = generateId();

      // Add user message
      const userMessage = {
        id: messageId,
        content: trimmedContent,
        sender: 'user',
        created_at: now
      };

      const db = await getDB();
      await db.add('messages', userMessage);

      set(state => ({
        messages: [...state.messages, userMessage]
      }));

      let aiResponse;
      
      if (get().aiMode === 'glm4') {
      } else if (get().aiMode === 'gemini') {
        try {
          aiResponse = await import('../lib/ai').then(mod => mod.sendToGemini(content));
        } catch (error) {
          console.error('Gemini API Error:', error);
          throw new Error(error.message || 'حدث خطأ أثناء الاتصال بـ Gemini');
        }

        try {
          // Initialize AI client
          const client = new AIClient({
            apiKey: FIXED_API_KEY,
            model: get().aiConfig.model,
            timeout: get().aiConfig.timeout,
            maxRetries: get().aiConfig.maxRetries
          });

          aiResponse = await client.sendMessage(content, {
            temperature: get().aiConfig.temperature,
            topP: get().aiConfig.topP,
            maxTokens: get().aiConfig.maxTokens,
            systemPrompt: get().aiConfig.systemPrompt
          });
        } catch (error) {
          console.error('AI API Error:', error);
          throw new Error(error.message || 'حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي');
        }
      } else {
        // Use predefined response
        const validResponses = get().predefinedResponses.filter(r => 
          !r.validUntil || new Date(r.validUntil) > new Date() 
        );

        if (validResponses.length === 0) {
          throw new Error('لا توجد ردود محددة مسبقاً متاحة');
        }

        // Select random predefined response
        const selectedResponse = validResponses[Math.floor(Math.random() * validResponses.length)];

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, selectedResponse.processingTime * 1000));
        
        aiResponse = { response: selectedResponse.response };
      }

      // Create AI message
      const aiMessage = {
        id: generateId(),
        user_id: user.id,
        content: aiResponse.response,
        sender: 'ai',
        created_at: new Date().toISOString()
      };

      // Save AI message to database
      await db.add('messages', aiMessage);

      set(state => ({ messages: [...state.messages, aiMessage], loading: false }));

    } catch (error) {
      console.error('Error sending message:', error);
      set({ 
        error: error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال الرسالة',
        loading: false 
      });
      throw error;
    }
  },

  clearMessages: async () => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');

      const db = getDB();
      db.prepare('DELETE FROM messages WHERE user_id = ?').run(user.id);

      set({ messages: [] });
    } catch (error) {
      console.error('Error clearing messages:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء مسح الرسائل' });
    }
  },

  saveFeedback: async (messageId: string, isCorrect: boolean, correction?: string) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');

      const db = getDB();
      const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId);

      if (message && message.user_id === user.id) {
        const feedback = JSON.stringify({ is_correct: isCorrect, correction });
        db.prepare('UPDATE messages SET feedback = ? WHERE id = ?').run(feedback, messageId);
      }

      set(state => ({
        messages: state.messages.map(msg =>
          msg.id === messageId
            ? { ...msg, feedback: { is_correct: isCorrect, correction } }
            : msg
        )
      }));
    } catch (error) {
      console.error('Error saving feedback:', error);
      set({ error: (error instanceof Error) ? error.message : 'حدث خطأ أثناء حفظ التقييم' });
    }
  },

  setAiMode: (mode) => set({ aiMode: mode }),

  updateAIConfig: (config) => set(state => ({
    aiConfig: { ...state.aiConfig, ...config }
  })),

  addPredefinedResponse: (response) => set(state => ({
    predefinedResponses: [
      ...state.predefinedResponses,
      {
        id: generateId(),
        ...response
      }
    ].map(r => ({ ...r }))
  }), false, () => {
    savePredefinedResponses(get().predefinedResponses);
  }),

  updatePredefinedResponse: (id, data) => set(state => ({
    predefinedResponses: state.predefinedResponses.map(response =>
      response.id === id 
        ? { ...response, ...data } 
        : response
    )
  }), false, () => {
    savePredefinedResponses(get().predefinedResponses);
  }),

  removePredefinedResponse: (id) => set(state => ({
    predefinedResponses: state.predefinedResponses.filter(r => r.id !== id)
  }), false, () => {
    savePredefinedResponses(get().predefinedResponses);
  })
}));