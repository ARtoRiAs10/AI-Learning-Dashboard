'use client';
import { useState, useEffect } from 'react';
import { progressAPI } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Brain, BookOpen, CreditCard, Trophy, Clock, Flame, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import useAuthStore from '@/lib/store';

const StatCard = ({ icon: Icon, label, value, sub, color = 'brand' }) => (
  <div className="glass rounded-2xl p-6 card-hover">
    <div className={`w-12 h-12 rounded-xl bg-${color}-600/20 flex items-center justify-center mb-4`}>
      <Icon className={`w-6 h-6 text-${color}-400`} />
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-slate-400">{label}</div>
    {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl px-4 py-3 text-sm">
        <p className="text-slate-300 font-medium">{label}</p>
        <p className="text-brand-400">{payload[0].value} min</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressAPI.getStats()
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-surface-800 rounded-2xl shimmer" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-surface-800 rounded-2xl shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {greeting}, <span className="gradient-text">{user?.first_name || user?.username}!</span>
          </h1>
          <p className="text-slate-400 mt-1">Here's your learning progress at a glance.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl">
          <Flame className="w-5 h-5 text-orange-400" />
          <span className="text-white font-bold">{stats?.streak || 0}</span>
          <span className="text-slate-400 text-sm">day streak</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Total Notes" value={stats?.notes?.total || 0}
          sub={`${stats?.notes?.processed || 0} processed`} color="brand" />
        <StatCard icon={CreditCard} label="Flashcards" value={stats?.flashcards?.total || 0}
          sub={`${stats?.flashcards?.due || 0} due for review`} color="purple" />
        <StatCard icon={Trophy} label="Avg Quiz Score" value={`${stats?.quizzes?.avg_score || 0}%`}
          sub={`${stats?.quizzes?.total || 0} quizzes taken`} color="yellow" />
        <StatCard icon={Clock} label="Study Time" value={`${Math.floor((stats?.study_time?.total_minutes || 0) / 60)}h`}
          sub={`${stats?.study_time?.weekly_minutes || 0} min this week`} color="green" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Weekly Activity</h2>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              <span>Last 7 days</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.activity || []}>
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="minutes" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Quizzes */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Quizzes</h2>
            <Link href="/quiz" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {stats?.recent_quizzes?.length ? (
            <div className="space-y-3">
              {stats.recent_quizzes.map((q, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-surface-900/50">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold
                    ${q.score >= 70 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {q.score}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{q.quiz_title}</p>
                    <p className="text-xs text-slate-500">{q.correct_answers}/{q.total_questions} correct</p>
                  </div>
                  <div className={`text-xs px-2.5 py-1 rounded-full ${q.score >= 70 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {q.score >= 70 ? 'Passed' : 'Failed'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500">
              <Trophy className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No quizzes yet</p>
              <Link href="/quiz" className="text-xs text-brand-400 mt-2 hover:underline">Take your first quiz →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/upload', icon: '📤', label: 'Upload Notes', desc: 'Add new study material' },
            { href: '/flashcards', icon: '🃏', label: 'Review Cards', desc: `${stats?.flashcards?.due || 0} cards due` },
            { href: '/quiz', icon: '🧠', label: 'Take a Quiz', desc: 'Test your knowledge' },
            { href: '/study-plan', icon: '📅', label: 'Study Plan', desc: 'AI-generated schedule' },
          ].map(({ href, icon, label, desc }) => (
            <Link key={href} href={href}
              className="glass rounded-2xl p-5 card-hover flex flex-col items-start gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="font-semibold text-white text-sm">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
