'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTickets, updateTicketStatus, type Ticket } from '@/lib/ticketSystem';

type FilterTab = 'all' | 'open' | 'in-progress' | 'resolved';

const STATUS_LABEL: Record<Ticket['status'], { text: string; color: string; bg: string }> = {
  'open': { text: '待處理', color: 'text-red-300', bg: 'bg-red-500/20 border-red-500/30' },
  'in-progress': { text: '處理中', color: 'text-amber-300', bg: 'bg-amber-500/20 border-amber-500/30' },
  'resolved': { text: '已解決', color: 'text-emerald-300', bg: 'bg-emerald-500/20 border-emerald-500/30' },
};

const PRIORITY_LABEL: Record<Ticket['priority'], { text: string; color: string }> = {
  'low': { text: '低', color: 'text-slate-400' },
  'medium': { text: '中', color: 'text-amber-400' },
  'high': { text: '高', color: 'text-red-400' },
};

function TicketCard({ ticket, onUpdate }: { ticket: Ticket; onUpdate: () => void }) {
  const statusInfo = STATUS_LABEL[ticket.status];
  const priorityInfo = PRIORITY_LABEL[ticket.priority];
  const date = new Date(ticket.createdAt).toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.07] transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-mono text-xs text-slate-500 mb-1">{ticket.id}</p>
          <h3 className="font-semibold text-sm text-white leading-snug">{ticket.summary}</h3>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
          <span className={`text-xs ${priorityInfo.color}`}>
            {priorityInfo.text}優先
          </span>
        </div>
      </div>

      {ticket.conversationSnapshot && (
        <details className="mb-3">
          <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
            查看對話紀錄
          </summary>
          <pre className="mt-2 text-xs text-slate-400 bg-slate-900/50 rounded-lg p-3 whitespace-pre-wrap overflow-x-auto border border-white/5">
            {ticket.conversationSnapshot}
          </pre>
        </details>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <span className="text-xs text-slate-500">{date}</span>
        <div className="flex gap-2">
          {ticket.status !== 'resolved' && (
            <button
              onClick={() => {
                const next: Ticket['status'] = ticket.status === 'open' ? 'in-progress' : 'resolved';
                updateTicketStatus(ticket.id, next);
                onUpdate();
              }}
              className="text-xs px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 rounded-lg transition-colors"
            >
              {ticket.status === 'open' ? '開始處理' : '標記已解決'}
            </button>
          )}
          {ticket.status === 'open' && (
            <button
              onClick={() => {
                updateTicketStatus(ticket.id, 'resolved');
                onUpdate();
              }}
              className="text-xs px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg transition-colors"
            >
              直接關閉
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ summary: '', priority: 'medium' as Ticket['priority'] });
  const [formError, setFormError] = useState('');

  const load = () => setTickets(getTickets());

  useEffect(() => {
    load();
  }, []);

  const filtered = tickets.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const counts = {
    all: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    'in-progress': tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.summary.trim()) {
      setFormError('請填寫問題摘要');
      return;
    }
    // Create with minimal data — no session
    const { createTicket, buildConversationSnapshot } = require('@/lib/ticketSystem');
    createTicket({
      sessionId: 'web-manual',
      summary: form.summary.trim(),
      conversationSnapshot: '(手動建立的工單)',
      language: 'zh-TW',
      priority: form.priority,
    });
    setForm({ summary: '', priority: 'medium' });
    setShowForm(false);
    setFormError('');
    load();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">← 首頁</Link>
            <span className="text-slate-600">|</span>
            <h1 className="font-semibold text-sm">🎫 工單系統</h1>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="text-sm px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            {showForm ? '取消' : '+ 新增工單'}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* New Ticket Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6">
            <h2 className="font-semibold mb-4">建立新工單</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">問題摘要 *</label>
                <textarea
                  value={form.summary}
                  onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                  placeholder="請描述您遇到的問題..."
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-indigo-500"
                />
                {formError && <p className="text-red-400 text-xs mt-1">{formError}</p>}
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">優先級</label>
                <div className="flex gap-3">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        checked={form.priority === p}
                        onChange={() => setForm(f => ({ ...f, priority: p }))}
                        className="accent-indigo-500"
                      />
                      <span className={`text-sm ${PRIORITY_LABEL[p].color}`}>
                        {PRIORITY_LABEL[p].text}優先
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold text-sm transition-colors"
              >
                送出工單
              </button>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'open', 'in-progress', 'resolved'] as FilterTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/10 text-slate-400 hover:text-white hover:bg-white/20'
              }`}
            >
              {tab === 'all' ? '全部' : tab === 'in-progress' ? '處理中' : STATUS_LABEL[tab as Ticket['status']].text}
              <span className="ml-1.5 opacity-60">({counts[tab]})</span>
            </button>
          ))}
        </div>

        {/* Ticket List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-4xl mb-4">📭</p>
            <p>{filter === 'all' ? '尚無工單' : `沒有「${filter === 'open' ? '待處理' : filter === 'in-progress' ? '處理中' : '已解決'}」的工單`}</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              建立第一張工單 →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} onUpdate={load} />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {tickets.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { label: '總工單', value: counts.all, icon: '📋' },
              { label: '待處理', value: counts.open, icon: '⏳', color: 'text-red-400' },
              { label: '已解決', value: counts.resolved, icon: '✅', color: 'text-emerald-400' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-xl mb-1">{s.icon}</p>
                <p className={`text-2xl font-bold ${s.color || 'text-white'}`}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
