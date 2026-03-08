'use client';
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { notesAPI, aiAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Map, Sparkles, Loader2, Calendar, Clock, CheckCircle, BookOpen, CreditCard, Trophy } from 'lucide-react';

const activityIcons = { review: '📖', flashcards: '🃏', quiz: '🏆', reading: '📚', practice: '✏️' };

export default function StudyPlanPage() {
  const [notes, setNotes] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [days, setDays] = useState(7);
  const [goals, setGoals] = useState('');
  const [plan, setPlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [completed, setCompleted] = useState(new Set());

  useEffect(() => {
    notesAPI.list({ status: 'processed' })
      .then(({ data }) => setNotes(data.results || data))
      .finally(() => setLoading(false));
  }, []);

  const toggleNote = (id) => {
    setSelectedNotes(p => p.includes(id) ? p.filter(n => n !== id) : [...p, id]);
  };

  const handleGenerate = async () => {
    if (!notes.length) { toast.error('Upload and process some notes first.'); return; }
    setGenerating(true);
    try {
      const { data } = await aiAPI.generateStudyPlan({
        days,
        goals,
        note_ids: selectedNotes.length ? selectedNotes : [],
      });
      setPlan(data);
      setActiveDay(1);
      setCompleted(new Set());
      toast.success('Study plan generated! 📅');
    } catch {
      toast.error('Failed to generate study plan.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleActivity = (key) => {
    setCompleted(p => {
      const next = new Set(p);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Study Plan</h1>
          <p className="text-slate-400">AI-generated personalized study schedule.</p>
        </div>

        {!plan ? (
          <div className="max-w-2xl space-y-5">
            <div className="glass rounded-2xl p-6 space-y-5">
              {/* Notes selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Select Notes to Include <span className="text-slate-500">(all used if none selected)</span>
                </label>
                {loading ? (
                  <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-10 shimmer rounded-xl" />)}</div>
                ) : notes.length ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {notes.map(note => (
                      <label key={note.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all
                        ${selectedNotes.includes(note.id) ? 'bg-brand-600/20 border border-brand-500/30' : 'glass hover:border-brand-500/20'}`}>
                        <input type="checkbox" checked={selectedNotes.includes(note.id)}
                          onChange={() => toggleNote(note.id)} className="accent-brand-500" />
                        <span className="text-sm text-white">{note.title}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 py-4 text-center">No processed notes. Upload some first!</p>
                )}
              </div>

              {/* Days */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Plan Duration</label>
                <div className="flex gap-3">
                  {[3, 7, 14, 30].map(d => (
                    <button key={d} onClick={() => setDays(d)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
                        ${days === d ? 'bg-brand-600 text-white' : 'glass text-slate-400 hover:text-white'}`}>
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Learning Goals (optional)</label>
                <textarea value={goals} onChange={e => setGoals(e.target.value)} rows={3}
                  placeholder="e.g., Prepare for my biology exam next week, focus on cell division..."
                  className="w-full px-4 py-3 bg-surface-900 border border-surface-700 rounded-xl text-white placeholder-slate-500 text-sm resize-none focus:border-brand-500 transition-colors" />
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || !notes.length}
              className="w-full py-4 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all">
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {generating ? 'Generating Plan...' : `Generate ${days}-Day Study Plan`}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Plan header */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{plan.title}</h2>
                  <p className="text-slate-400 text-sm mb-3">{plan.goal}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{plan.duration_days} days</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{plan.daily_study_time}/day</span>
                  </div>
                </div>
                <button onClick={() => setPlan(null)}
                  className="px-4 py-2 glass rounded-xl text-sm text-slate-400 hover:text-white transition-colors">
                  New Plan
                </button>
              </div>

              {/* Tips */}
              {plan.tips?.length > 0 && (
                <div className="mt-5 pt-5 border-t border-white/5">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Study Tips</h3>
                  <div className="space-y-1">
                    {plan.tips.map((tip, i) => (
                      <p key={i} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="text-brand-400 mt-0.5">•</span>{tip}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Day selector */}
              <div className="glass rounded-2xl p-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Days</h3>
                <div className="space-y-1">
                  {plan.days?.map(day => {
                    const dayActivities = day.activities || [];
                    const completedCount = dayActivities.filter((_, i) => completed.has(`${day.day}-${i}`)).length;
                    return (
                      <button key={day.day} onClick={() => setActiveDay(day.day)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all
                          ${activeDay === day.day ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30' : 'text-slate-400 hover:text-white hover:bg-surface-800/50'}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Day {day.day}</span>
                          {completedCount > 0 && <span className="text-xs text-green-400">{completedCount}/{dayActivities.length}</span>}
                        </div>
                        <p className="text-xs opacity-60 truncate mt-0.5">{day.theme}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day detail */}
              <div className="lg:col-span-3">
                {plan.days?.filter(d => d.day === activeDay).map(day => (
                  <div key={day.day} className="space-y-4">
                    <div className="glass rounded-2xl p-5">
                      <h3 className="text-lg font-semibold text-white mb-1">Day {day.day}: {day.theme}</h3>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {day.objectives?.map((obj, i) => (
                          <span key={i} className="text-xs px-3 py-1 bg-brand-600/20 text-brand-300 rounded-full">
                            {obj}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {day.activities?.map((activity, i) => {
                        const key = `${day.day}-${i}`;
                        const done = completed.has(key);
                        return (
                          <div key={i} className={`glass rounded-2xl p-5 flex items-start gap-4 transition-all
                            ${done ? 'opacity-60' : ''}`}>
                            <span className="text-2xl flex-shrink-0">{activityIcons[activity.type] || '📌'}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-white text-sm">{activity.title}</h4>
                                <span className="text-xs px-2 py-0.5 glass rounded-full text-slate-400">{activity.type}</span>
                              </div>
                              <p className="text-sm text-slate-400 mb-2">{activity.description}</p>
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Clock className="w-3 h-3" />{activity.duration}
                              </span>
                            </div>
                            <button onClick={() => toggleActivity(key)}
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all
                                ${done ? 'bg-green-500/30 text-green-400' : 'bg-surface-800 text-slate-500 hover:text-white'}`}>
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
