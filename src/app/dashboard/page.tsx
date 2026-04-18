'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllConversations } from '@/lib/chatContext';
import { faqs } from '@/lib/faqData';

interface DailyStats {
  date: string;
  label: string;
  conversations: number;
  resolved: number;
  satisfaction: number;
}

function generateMockData(): DailyStats[] {
  const days = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
  const today = new Date();
  return days.map((label, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const date = `${d.getMonth() + 1}/${d.getDate()}`;
    const base = 40 + Math.sin(i * 1.2) * 20;
    return {
      date,
      label,
      conversations: Math.round(base + Math.random() * 15),
      resolved: Math.round(75 + Math.random() * 20),
      satisfaction: Math.round(82 + Math.random() * 15),
    };
  });
}

function TopFAQItem({ rank, question, count }: { rank: number; question: string; count: number }) {
  const maxCount = 120;
  const barWidth = Math.min((count / maxCount) * 100, 100);
  return (
    <div className="flex items-center gap-3 py-2">
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
        rank === 1 ? 'bg-amber-400 text-amber-900' :
        rank === 2 ? 'bg-slate-300 text-slate-700' :
        rank === 3 ? 'bg-orange-400 text-orange-900' :
        'bg-white/10 text-slate-400'
      }`}>
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-200 truncate">{question}</span>
          <span className="text-slate-400 ml-2 flex-shrink-0">{count} 次</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              rank === 1 ? 'bg-amber-400' :
              rank === 2 ? 'bg-slate-300' :
              rank === 3 ? 'bg-orange-400' :
              'bg-indigo-400'
            }`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [dailyData, setDailyData] = useState<DailyStats[]>([]);
  const [stats, setStats] = useState({ conversations: 0, resolved: 0, satisfaction: 0 });
  const [topFAQs, setTopFAQs] = useState<{ question: string; count: number }[]>([]);

  useEffect(() => {
    const savedStats = localStorage.getItem('sierra_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    } else {
      const mock = { conversations: 247, resolved: 89, satisfaction: 94 };
      setStats(mock);
      localStorage.setItem('sierra_stats', JSON.stringify(mock));
    }

    setDailyData(generateMockData());

    const allConv = getAllConversations();
    const faqCounts: Record<string, number> = {};
    allConv.forEach(conv => {
      conv.messages.filter(m => m.role === 'user').forEach(m => {
        const matched = faqs.find(fq =>
          fq.keywords.some(kw => m.content.toLowerCase().includes(kw.toLowerCase()))
        );
        if (matched) {
          const key = matched.answer['zh-TW'].slice(0, 30);
          faqCounts[key] = (faqCounts[key] || 0) + 1;
        }
      });
    });
    const sorted = Object.entries(faqCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([q, c]) => ({ question: q + '...', count: c }));

    if (sorted.length < 5) {
      setTopFAQs([
        { question: '關於價格與方案諮詢', count: 87 },
        { question: '如何開通與設定帳戶', count: 63 },
        { question: '密碼重設與登入問題', count: 45 },
        { question: '功能介紹與使用方式', count: 38 },
        { question: '付款方式相關問題', count: 29 },
      ]);
    } else {
      setTopFAQs(sorted);
    }
  }, []);

  const maxConv = Math.max(...dailyData.map(d => d.conversations), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">← 首頁</Link>
            <span className="text-slate-600">|</span>
            <h1 className="font-semibold text-sm">📊 數據儀表板</h1>
          </div>
          <div className="text-xs text-slate-500">
            數據更新：{new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: '💬', label: '總對話數', value: stats.conversations || 247 },
            { icon: '✅', label: '解決率', value: `${stats.resolved || 89}%` },
            { icon: '⭐', label: '滿意度', value: `${stats.satisfaction || 94}%` },
          ].map(k => (
            <div key={k.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{k.icon}</span>
              </div>
              <p className="text-2xl font-bold">{k.value}</p>
              <p className="text-slate-400 text-xs mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Conversation Trend */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold mb-6">📈 近 7 天對話量趨勢</h2>
          <div className="flex items-end gap-3" style={{ height: '180px' }}>
            {dailyData.map((d, i) => {
              const heightPct = (d.conversations / maxConv) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end" style={{ height: '150px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg relative group cursor-default transition-all hover:brightness-125"
                      style={{ height: `${heightPct}%`, minHeight: '8px' }}
                      title={`${d.label} ${d.date}: ${d.conversations} 對話`}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/20">
                        {d.conversations} 對話
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{d.label}</span>
                  <span className="text-xs text-slate-600">{d.date}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-2">平均解決率</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-emerald-400">
                  {Math.round(dailyData.reduce((a, d) => a + d.resolved, 0) / dailyData.length)}%
                </span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                    style={{ width: `${dailyData.reduce((a, d) => a + d.resolved, 0) / dailyData.length}%` }}
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2">平均滿意度</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-amber-400">
                  {Math.round(dailyData.reduce((a, d) => a + d.satisfaction, 0) / dailyData.length)}%
                </span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                    style={{ width: `${dailyData.reduce((a, d) => a + d.satisfaction, 0) / dailyData.length}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hot FAQs */}
        <div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold mb-4">🔥 熱門問題排行榜</h2>
            <div className="space-y-1">
              {topFAQs.map((faq, i) => (
                <TopFAQItem key={i} rank={i + 1} question={faq.question} count={faq.count} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
