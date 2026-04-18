'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { findFAQAnswer, detectLanguage, type Language } from '@/lib/faqData';
import { saveMessage, getConversationContext, clearConversation } from '@/lib/chatContext';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  language?: Language;
}

const ESCALATION_KEYWORDS = ['轉真人', '客服', '人工', 'real agent', 'human', '人工客服', '转人工', '转真人', '找客服'];

function isEscalation(text: string): boolean {
  const lower = text.toLowerCase();
  return ESCALATION_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const SESSION_ID = 'web-' + generateId();

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'init',
    role: 'assistant',
    content: '您好！我是 Sierra AI 客服，24 小時為您服務。👋\n\n我可以幫您解答關於價格、功能、付款、技術問題等疑問。\n\n請輸入您的問題，或直接告訴我您想了解什麼！',
    language: 'zh-TW',
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState<Language>('zh-TW');
  const [isEscalated, setIsEscalated] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load saved conversation on mount
  useEffect(() => {
    const saved = getConversationContext(SESSION_ID);
    if (saved.length > 0) {
      const loaded: Message[] = saved.map(m => ({
        id: generateId(),
        role: m.role,
        content: m.content,
        language: m.language,
      }));
      setMessages(prev => {
        if (prev.length <= 1) return [...prev, ...loaded];
        return prev;
      });
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const detectLang = (text: string): Language => {
    const zhCNChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const enWords = (text.match(/[a-zA-Z]+/g) || []).length;
    const total = text.replace(/\s/g, '').length || 1;
    const zhCNRatio = zhCNChars / total;

    if (zhCNRatio > 0.3) {
      const traditionalIndicators = ['嗎', '麼', '這', '個', '說', '時', '國', '開', '關', '長', '門', '東', '會', '請', '您', '我', '的'];
      const hasTraditional = traditionalIndicators.some(ind => text.includes(ind));
      return hasTraditional ? 'zh-TW' : 'zh-CN';
    }
    if (enWords > zhCNChars) return 'en';
    return 'zh-TW';
  };

  const sendBotReply = (userText: string, detectedLang: Language) => {
    // Escalation check
    if (isEscalation(userText)) {
      setIsEscalated(true);
      const reply = detectedLang === 'zh-CN'
        ? '好的，我為您轉接真人客服！請稍候，我們的客服專員很快就會回覆您。🔄\n\n在此期間，您可以繼續描述您的問題，我們的團隊會同步收到記錄。'
        : detectedLang === 'en'
        ? 'Okay, I am transferring you to a human agent! Please hold on, our support specialist will be with you shortly. 🔄\n\nWhile you wait, feel free to describe your issue — our team will receive the transcript.'
        : '好的，我為您轉接真人客服！請稍候，我們的客服專員很快就會回覆您。🔄\n\n在此期間，您可以繼續描述您的問題，我們的團隊會同步收到記錄。';
      return reply;
    }

    const answer = findFAQAnswer(userText, detectedLang);
    if (answer) return answer;

    // Fallback based on language
    const fallbacks: Record<Language, string> = {
      'zh-TW': '感謝您的提問！這個問題我可以幫您記錄下來，我們的團隊會盡快回覆您。您也可以嘗試更詳細地描述問題，或點擊「建立工單」讓我們的客服專員處理。',
      'zh-CN': '感谢您的提问！这个问题我可以帮您记录下来，我们的团队会尽快回复您。您也可以尝试更详细地描述问题，或点击「建立工单」让我们的客服专员处理。',
      'en': 'Thanks for your question! I have noted this down and our team will get back to you shortly. Try describing your issue in more detail, or click "Create Ticket" and our support specialist will follow up.',
    };
    return fallbacks[detectedLang];
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const detectedLang = detectLang(text);
    setLanguage(detectedLang);

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      language: detectedLang,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveMessage(SESSION_ID, { id: userMsg.id, role: 'user', content: text, timestamp: Date.now(), language: detectedLang });
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));

    const botContent = sendBotReply(text, detectedLang);
    const botMsg: Message = {
      id: generateId(),
      role: 'assistant',
      content: botContent,
      language: detectedLang,
    };

    setMessages(prev => [...prev, botMsg]);
    saveMessage(SESSION_ID, { id: botMsg.id, role: 'assistant', content: botContent, timestamp: Date.now(), language: detectedLang });
    setIsTyping(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    clearConversation(SESSION_ID);
    setMessages(INITIAL_MESSAGES);
    setIsEscalated(false);
  };

  // Stats tracking
  useEffect(() => {
    const saved = localStorage.getItem('sierra_stats');
    const stats = saved ? JSON.parse(saved) : { conversations: 0, resolved: 0, satisfaction: 0 };
    const stored = sessionStorage.getItem('sierra_session_counted');
    if (!stored) {
      stats.conversations = (stats.conversations || 0) + 1;
      localStorage.setItem('sierra_stats', JSON.stringify(stats));
      sessionStorage.setItem('sierra_session_counted', '1');
    }
  }, []);

  const escaladeText = isEscalated
    ? language === 'zh-CN'
      ? '🔴 已轉接真人客服'
      : language === 'en'
      ? '🔴 Transferred to human agent'
      : '🔴 已轉接真人客服'
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">← 首頁</Link>
            <span className="text-slate-600">|</span>
            <h1 className="font-semibold text-sm">💬 對話中</h1>
          </div>
          <div className="flex items-center gap-3">
            {escaladeText && (
              <span className="text-xs bg-red-500/20 text-red-300 px-3 py-1 rounded-full border border-red-500/30">
                {escaladeText}
              </span>
            )}
            <button
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1 rounded border border-white/10 hover:border-white/30"
            >
              清除對話
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : msg.role === 'system'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30 rounded-xl text-xs'
                    : 'bg-white/10 text-slate-100 rounded-bl-sm'
                }`}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-white/10 bg-slate-950/50">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {['價格方案', '如何開通', '忘記密碼', '聯絡客服'].map(q => (
              <button
                key={q}
                onClick={() => { setInput(q); inputRef.current?.focus(); }}
                className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 rounded-full px-3 py-1.5 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {isEscalated && (
            <div className="mb-3">
              <Link
                href={`/tickets?session=${SESSION_ID}`}
                className="inline-flex items-center gap-2 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 rounded-xl px-4 py-2 transition-colors"
              >
                🎫 建立工單（記錄此對話）
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="輸入訊息...（Enter 發送，Shift+Enter 換行）"
              rows={1}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              style={{ maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold text-sm transition-colors"
            >
              送出
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            {language === 'zh-CN' ? '🌐 簡體中文模式' : language === 'en' ? '🌐 English mode' : '🌐 繁體中文模式'}
          </p>
        </div>
      </div>
    </div>
  );
}
