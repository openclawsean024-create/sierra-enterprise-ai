'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [stats, setStats] = useState({ conversations: 0, resolved: 0, satisfaction: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('sierra_stats');
    if (saved) setStats(JSON.parse(saved));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-1.5 text-xs font-medium text-indigo-300 mb-4">
            🤖 AI Customer Agent · 24/7 Online
          </div>
          <h1 className="text-4xl font-bold mb-3">Sierra 企業客服 AI</h1>
          <p className="text-slate-400 max-w-xl mx-auto">中小企客服場景的 AI Agent，全天候處理常見問題、引導操作，降低人工客服負擔。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: '💬', label: '今日對話', value: stats.conversations || 0 },
            { icon: '✅', label: '解決率', value: `${stats.resolved || 0}%` },
            { icon: '⭐', label: '滿意度', value: `${stats.satisfaction || 0}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <span className="text-3xl">{s.icon}</span>
              <p className="text-3xl font-bold mt-2">{s.value}</p>
              <p className="text-slate-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/chat" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold text-center transition-colors">
            💬 開始對話
          </Link>
          <Link href="/dashboard" className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-center transition-colors">
            📊 儀表板
          </Link>
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold mb-4">🤖 核心功能</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {['FAQ 智能匹配', '3 輪對話記憶', '嵌入 Widget', '數據分析儀表板', 'API Key 管理', '滿意度評分', 'CSV 匯出', '手機響應式'].map(f => (
              <div key={f} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                <span className="text-emerald-400">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
