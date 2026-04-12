export interface Ticket {
  id: string;
  sessionId: string;
  summary: string;
  conversationSnapshot: string;
  language: 'zh-TW' | 'en' | 'zh-CN';
  createdAt: number;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
}

const TICKETS_KEY = 'sierra_tickets';

export function createTicket(params: {
  sessionId: string;
  summary: string;
  conversationSnapshot: string;
  language: 'zh-TW' | 'en' | 'zh-CN';
  priority?: 'low' | 'medium' | 'high';
}): Ticket {
  const ticket: Ticket = {
    id: `TKT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    sessionId: params.sessionId,
    summary: params.summary,
    conversationSnapshot: params.conversationSnapshot,
    language: params.language,
    createdAt: Date.now(),
    status: 'open',
    priority: params.priority || 'medium',
  };

  if (typeof window !== 'undefined') {
    const tickets = getTickets();
    tickets.unshift(ticket);
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  }

  return ticket;
}

export function getTickets(): Ticket[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function updateTicketStatus(ticketId: string, status: Ticket['status']): void {
  if (typeof window === 'undefined') return;
  const tickets = getTickets();
  const idx = tickets.findIndex(t => t.id === ticketId);
  if (idx !== -1) {
    tickets[idx].status = status;
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  }
}

export function buildConversationSnapshot(messages: { content: string; role: string }[]): string {
  return messages.map(m => `${m.role === 'user' ? '👤 用戶' : '🤖 AI'}：${m.content}`).join('\n');
}
