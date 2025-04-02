
// Gemini API Integration
const GEMINI_API_KEY = localStorage.getItem("geminiApiKey") || ""; // مفتاح جيميناي الثابت
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-0313:generateContent";

// إرسال prompt إلى Gemini
export async function sendToGemini(prompt: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `أجب كخبير قانوني محترف، اجعل الرد مفصلًا ومنطقيًا بناءً على القانون المصري.
السؤال: ${prompt}` }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 1000 }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("Gemini API Error: " + errorText);
  }

  const result = await response.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text || "لا يوجد رد من Gemini.";
}


import { z } from 'zod';
import { toast } from 'react-hot-toast';

// Model Configuration
export const MODELS = {
  GLM_4: 'glm-4',
  GLM_4_PLUS: 'glm-4-plus',
  GLM_4_0520: 'glm-4-0520',
  GLM_4_AIR: 'glm-4-air',
  GLM_4_AIRX: 'glm-4-airx',
  GLM_4_LONG: 'glm-4-long',
  GLM_4_FLASH: 'glm-4-flash'
} as const;

// Fixed API key
export const FIXED_API_KEY = 'bf1b0ac8dd3e43b4a7ec771fea86da9f.dELCZihIKDB07yjU';

type ModelType = typeof MODELS[keyof typeof MODELS];

// Error Types
export class AIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'AIError';
  }
}

// Content Formatting
interface FormattedContent {
  type: 'title' | 'section' | 'text' | 'list' | 'article' | 'warning' | 'success';
  content: string;
  items?: string[];
}

function formatLegalContent(content: string): FormattedContent[] {
  const formatted: FormattedContent[] = [];
  const lines = content.split('\n');
  let currentSection: FormattedContent | null = null;
  let listItems: string[] = [];

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;

    // Detect titles
    if (line.includes('مذكرة') || line.includes('دفوع')) {
      formatted.push({ type: 'title', content: line });
      continue;
    }

    // Detect legal articles
    if (line.includes('المادة')) {
      formatted.push({ type: 'article', content: line });
      continue;
    }

    // Detect sections
    if (line.includes(':')) {
      const [title, ...content] = line.split(':');
      if (currentSection) {
        if (listItems.length > 0) {
          currentSection.items = [...listItems];
          listItems = [];
        }
        formatted.push(currentSection);
      }
      currentSection = {
        type: 'section',
        content: title.trim() + ':' + content.join(':').trim()
      };
      continue;
    }

    // Detect list items
    if (line.startsWith('-') || line.startsWith('•')) {
      listItems.push(line.slice(1).trim());
      continue;
    }

    // Detect warnings
    if (line.includes('تحذير') || line.includes('ملاحظة هامة')) {
      formatted.push({ type: 'warning', content: line });
      continue;
    }

    // Add remaining text
    if (currentSection) {
      if (listItems.length > 0) {
        currentSection.items = [...listItems];
        listItems = [];
      }
      formatted.push(currentSection);
      currentSection = null;
    }
    formatted.push({ type: 'text', content: line });
  }

  // Add any remaining section
  if (currentSection) {
    if (listItems.length > 0) {
      currentSection.items = [...listItems];
    }
    formatted.push(currentSection);
  }

  return formatted;
}

// Message Schema
const MessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string()
});

type Message = z.infer<typeof MessageSchema>;

export interface AIResponse {
  response: string;
  metadata?: {
    processingTime: number;
    tokens: number;
    model: string;
  };
}

interface AIRequestOptions {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  defaultPromptId?: string;
  systemPrompt?: string;
}

interface AIConfig {
  model?: ModelType;
  timeout?: number;
  maxRetries?: number;
  defaultSystemPrompt?: string;
}

// Legal templates for chat interface
const LEGAL_TEMPLATES = {
  DEFENSE_MEMO: `أنت محامي خبير في صياغة المذكرات القانونية. عند كتابة مذكرة دفاع:
- ابدأ بملخص موجز للقضية
- اذكر الوقائع بتسلسل زمني
- اعرض الأسانيد القانونية مع ذكر مواد القانون
- قدم الدفوع الشكلية ثم الموضوعية
- اختم بالطلبات`,
  
  LEGAL_ANALYSIS: `أنت مستشار قانوني متخصص في التحليل القانوني. عند تحليل مسألة قانونية:
- حدد القضايا القانونية الرئيسية
- اشرح القوانين والسوابق ذات الصلة
- قيم نقاط القوة والضعف
- قدم توصيات عملية`,
  
  CONTRACT_DRAFTING: `أنت خبير في صياغة العقود. عند إعداد عقد:
- تأكد من تحديد أطراف العقد بدقة
- اكتب البنود بلغة واضحة وقانونية
- غطِ جميع الجوانب الأساسية (المدة، الالتزامات، التعويضات)
- أضف بنود حماية مناسبة`,
  
  COURT_PLEADING: `أنت متخصص في صياغة الدعاوى القضائية. عند كتابة صحيفة دعوى:
- حدد المحكمة المختصة
- اذكر بيانات الأطراف كاملة
- اشرح الوقائع بوضوح
- اذكر الأسانيد القانونية
- حدد الطلبات بدقة`
};

export class AIClient {
  private config: Required<AIConfig>;
  private controller: AbortController | null = null;
  private conversationHistory: Message[] = [];
  private defaultPrompt: string | null = null;
  private timeoutId: NodeJS.Timeout | null = null;
  private maxHistoryLength: number = 10;

  constructor(config: AIConfig = {}) {
    this.config = {
      model: config.model || MODELS.GLM_4_0520,
      timeout: config.timeout || 60000,
      maxRetries: config.maxRetries || 3,
      defaultSystemPrompt: config.defaultSystemPrompt || 'أنت مساعد قانوني ذكي يقدم استشارات قانونية دقيقة ومهنية. تتحدث باللغة العربية وتفهم القوانين المصرية جيداً.'
    };

    // Initialize conversation with system prompt
    if (this.config.defaultSystemPrompt) {
      this.conversationHistory.push({
        role: 'system',
        content: this.config.defaultSystemPrompt
      });
    }
  }

  async setDefaultPrompt(promptId: string) {
    this.defaultPrompt = promptId;
  }

  async sendMessage(content: string, options: AIRequestOptions = {}): Promise<AIResponse> {
    // Create new abort controller for this request
    this.controller = new AbortController();
    
    // Set timeout
    const timeoutPromise = new Promise((_, reject) => {
      this.timeoutId = setTimeout(() => {
        if (this.controller) {
          this.controller.abort();
        }
        reject(new AIError('انتهت مهلة الطلب', 'TIMEOUT'));
      }, this.config.timeout);
    });

    try {
      // Combine default prompt with user content if available
      const finalContent = this.defaultPrompt 
        ? `${this.defaultPrompt}\n\nالمطلوب:\n${content}`
        : content;
      
      // Prepare request with enhanced system context
      const requestBody = {
        model: this.config.model,
        messages: this.getContextualMessages(content),
        temperature: options.temperature ?? 0.7,
        top_p: options.topP ?? 0.7,
        max_tokens: options.maxTokens ?? 2048
      };

      // Make API request with timeout
      const response = await Promise.race([
        fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FIXED_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      }),
      timeoutPromise
      ]);
      
      // Clear timeout
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new AIError(
          error.message || 'حدث خطأ أثناء الاتصال بالخدمة',
          error.code || 'API_ERROR',
          response.status
        );
      }
      
      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      // Format the response content
      const formattedContent = formatLegalContent(aiResponse);
      
      return {
        response: aiResponse,
        formattedContent,
        metadata: {
          processingTime: data.usage.total_time,
          tokens: data.usage.total_tokens,
          model: this.config.model
        }
      };
      
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new AIError('تم إلغاء الطلب', 'REQUEST_ABORTED');
      }
      throw error;
    } finally {
      if (this.controller) {
        this.controller = null;
      }
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    }
  }

  private getContextualMessages(currentContent: string): Message[] {
    // Get last N messages for context
    const recentHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    
    // Build contextual messages array
    return [
      // System prompt with templates
      {
        role: 'system',
        content: `${this.config.defaultSystemPrompt}\n\nيجب أن تكون إجاباتك:\n- شاملة ومفصلة\n- مدعمة بالمراجع القانونية\n- تغطي جميع جوانب السؤال\n- تقدم أمثلة عملية عند الحاجة\n- تشرح المفاهيم القانونية بوضوح`
      },
      // Recent conversation history
      ...recentHistory,
      // Current message
      {
        role: 'user',
        content: currentContent
      }
    ];
  }

  clearConversation() {
    this.conversationHistory = [];
    // Re-add system prompt
    if (this.config.defaultSystemPrompt) {
      this.conversationHistory.push({
        role: 'system',
        content: this.config.defaultSystemPrompt
      });
    }
  }

  dispose() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
    this.clearConversation();
  }

  // Export models and templates for external use
  static Models = MODELS;
  static Templates = LEGAL_TEMPLATES;
}