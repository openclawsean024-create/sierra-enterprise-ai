export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  language?: 'zh-TW' | 'en' | 'zh-CN';
}

const MAX_CONTEXT_TURNS = 3; // 保留最近 3 輪（6 則訊息）

export function getConversationContext(sessionId: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  const key = `sierra_conv_${sessionId}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const messages: ChatMessage[] = JSON.parse(raw);
    return messages.slice(-MAX_CONTEXT_TURNS * 2);
  } catch {
    return [];
  }
}

export function saveMessage(sessionId: string, message: ChatMessage): void {
  if (typeof window === 'undefined') return;
  const key = `sierra_conv_${sessionId}`;
  const messages = getConversationContext(sessionId);
  messages.push(message);
  // 只保留最近 MAX_CONTEXT_TURNS*2 則
  const trimmed = messages.slice(-MAX_CONTEXT_TURNS * 2);
  localStorage.setItem(key, JSON.stringify(trimmed));
}

export function getFullConversation(sessionId: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  const key = `sierra_conv_${sessionId}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function clearConversation(sessionId: string): void {
  if (typeof window === 'undefined') return;
  const key = `sierra_conv_${sessionId}`;
  localStorage.removeItem(key);
}

export function getAllConversations(): { sessionId: string; messages: ChatMessage[]; lastUpdate: number }[] {
  if (typeof window === 'undefined') return [];
  const results: { sessionId: string; messages: ChatMessage[]; lastUpdate: number }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('sierra_conv_')) {
      const sessionId = key.replace('sierra_conv_', '');
      const messages = getFullConversation(sessionId);
      if (messages.length > 0) {
        const lastUpdate = Math.max(...messages.map(m => m.timestamp));
        results.push({ sessionId, messages, lastUpdate });
      }
    }
  }
  return results.sort((a, b) => b.lastUpdate - a.lastUpdate);
}
