'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { findFAQAnswer, detectLanguage, Language } from '@/lib/faqData';
import { saveMessage, getConversationContext, getFullConversation } from '@/lib/chatContext';
import { createTicket, buildConversationSnapshot } from '@/lib/ticketSystem';

const ESCALATION_KEYWORDS = ['轉真人', '真人', '客服人員', '人工', 'real agent', 'human', 'escalate', ' speak to human'];
const TICKET_KEYWORDS = ['建單', '開工單', '問題', 'issue', 'problem', '需要一个', '需要幫助', '建立工单', '開工單'];

function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const DEFAULT_GREETING: Record<Language, string> = {
  'zh-TW': '👋 您好！我是 Sierra AI 客服，很高興為您服務。請輸入您想詢問的問題，我會立即為您解答。',
  'en': '👋 Hello! I\'m Sierra AI Customer Support, happy to help you. Please enter your question and I\'ll answer right away.',
  'zh-CN': '👋 您好！我是 Sierra AI 客服，很高兴为您服务。请输入您想问的问题，我会立即为您解答。',
};

const ESCALATION_MSG: Record<Language, string> = {
  'zh-TW': '🔔 我已通知真人客服團隊，他們將儘快與您聯繫。請稍候，您的對話記錄已完整保留。',
  'en': '🔔 I\'ve notified our live support team. They will contact you shortly. Your conversation history has been saved.',
  'zh-CN': '🔔 我已通知真人客服团队，他们将尽快与您联繫。您的对话记录已完整保留。',
};

const TICKET_MSG: Record<Language, string> = {
  'zh-TW': '📝 我已為您建立工單，客服團隊將儘快處理並回覆您。',
  'en': '📝 I\'ve created a support ticket for you. Our team will handle it and get back to you soon.',
  'zh-CN': '📝 我已为您建立工单，客服团队将尽快处理并回复您。',
};

const FALLBACK_MSG: Record<Language, string> = {
  'zh-TW': '🤔 抱歉，我目前無法回答這個問題。我已將您的问题记录下来，客服团队会尽快与您联系。',
  'en': '🤔 I\'m sorry, I\'m unable to answer this question at the moment. I\'ve logged your issue and our team will follow up shortly.',
  'zh-CN': '🤔 抱歉，我目前无法回答这个问题。我已将您的问题记录下来，客服团队会尽快与您联繫。',
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatWidgetProps {
  sessionId?: string;
  embedded?: boolean;
}

export default function ChatWidget({ sessionId: externalSessionId, embedded = false }: ChatWidgetProps) {
  const [sessionId] = useState(() => externalSessionId || generateSessionId());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);
  const [language, setLanguage] = useState<Language>('zh-TW');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendNotification = useCallback((type: 'escalation' | 'ticket', data: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage({ type, data, sessionId }, '*');
    }
  }, [sessionId]);

  useEffect(() => {
    const saved = getConversationContext(sessionId);
    if (saved.length === 0) {
      setMessages([{
        id: `init_${Date.now()}`,
        role: 'assistant',
        content: DEFAULT_GREETING[language],
        timestamp: Date.now(),
      }]);
    } else {
      setMessages(saved as Message[]);
    }
  }, [sessionId, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleEscalation = (lang: Language) => {
    setIsEscalating(true);
    const fullConv = getFullConversation(sessionId);
    const assistantMsg: Message = {
      id: `escalate_${Date.now()}`,
      role: 'assistant',
      content: ESCALATION_MSG[lang],
      timestamp: Date.now(),
    };
    const newMessages = [...messages, assistantMsg];
    setMessages(newMessages);
    saveMessage(sessionId, { ...assistantMsg, language: lang });
    sendNotification('escalation', { messages: fullConv, timestamp: Date.now() });
  };

  const handleTicket = (lang: Language, conversation: Message[]) => {
    const snapshot = buildConversationSnapshot(conversation);
    createTicket({
      sessionId,
      summary: conversation[conversation.length - 1]?.content.slice(0, 100) || 'User inquiry',
      conversationSnapshot: snapshot,
      language: lang,
    });
    const assistantMsg: Message = {
      id: `ticket_${Date.now()}`,
      role: 'assistant',
      content: TICKET_MSG[lang],
      timestamp: Date.now(),
    };
    const newMessages = [...messages, assistantMsg];
    setMessages(newMessages);
    saveMessage(sessionId, { ...assistantMsg, language: lang });
    sendNotification('ticket', { sessionId, summary: snapshot, timestamp: Date.now() });
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const detectedLang = detectLanguage(input);
    const lang = detectedLang === 'en' || detectedLang === 'zh-CN' || detectedLang === 'zh-TW'
      ? detectedLang
      : language;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveMessage(sessionId, { ...userMsg, language: lang });
    setLanguage(lang);
    setInput('');

    // 檢查關鍵字
    const lowerInput = input.toLowerCase();
    const isEscalation = ESCALATION_KEYWORDS.some(kw => lowerInput.includes(kw.toLowerCase()));
    const isTicket = TICKET_KEYWORDS.some(kw => lowerInput.includes(kw.toLowerCase()));

    if (isEscalation) {
      handleEscalation(lang);
      return;
    }

    if (isTicket) {
      handleTicket(lang, newMessages);
      return;
    }

    // 關鍵字匹配回答
    const answer = findFAQAnswer(input, lang);
    let response: string;
    if (answer) {
      response = answer;
    } else {
      response = FALLBACK_MSG[lang];
    }

    const assistantMsg: Message = {
      id: `asst_${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    };

    const finalMessages = [...newMessages, assistantMsg];
    setMessages(finalMessages);
    saveMessage(sessionId, { ...assistantMsg, language: lang });
  };

  return (
    <div className={`flex flex-col ${embedded ? 'h-full' : 'h-screen'} bg-gray-50`}>
      {/* Header */}
      <div className="bg-indigo-600 text-white px-4 py-3 flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">SI</div>
        <div>
          <div className="font-semibold text-sm">Sierra AI 客服</div>
          <div className="text-xs text-indigo-200">24 小時線上服務</div>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-xs">線上</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-sm'
                : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white p-3 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="輸入您的問題..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isEscalating}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <div className="text-center text-xs text-gray-400 mt-2">
          按 Enter 傳送 · 輸入「轉真人」連接專人服務
        </div>
      </div>
    </div>
  );
}
