'use client';
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { topicsAPI, notesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, BookOpen, Trash2, FileText, Tag, Loader2, X, Search } from 'lucide-react';
import Link from 'next/link';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];
const ICONS = ['📚', '🧪', '📐', '🌍', '💻', '🎨', '🔬', '📊', '🎵', '📖'];

export default function TopicsPage() {
  const [topics, setTopics] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1', icon: '📚' });

  useEffect(() => {
    Promise.all([
      topicsAPI.list(),
      notesAPI.list()
    ]).then(([t, n]) => {
      setTopics(t.data.results || t.data);
      setNotes(n.data.results || n.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await topicsAPI.create(form);
      setTopics(p => [data, ...p]);
      setShowCreate(false);
      setForm({ name: '', description: '', color: '#6366f1', icon: '📚' });
      toast.success('Topic created!');
    } catch {
      toast.error('Failed to create topic.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this topic?')) return;
    await topicsAPI.delete(id);
    setTopics(p => p.filter(t => t.id !== id));
    if (selectedTopic?.id === id) setSelectedTopic(null);
    toast.success('Topic deleted');
  };

  const filteredTopics = topics.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  const topicNotes = selectedTopic ? notes.filter(n => n.topic === selectedTopic.id) : [];

  if (loading) {
    return <AppLayout><div className="grid grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-32 shimmer rounded-2xl" />)}</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Topics Library</h1>
            <p className="text-slate-400">Organize your notes by subject.</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-all text-sm">
            <Plus className="w-4 h-4" /> New Topic
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search topics..."
            className="w-full pl-11 pr-4 py-3 glass rounded-xl text-white placeholder-slate-500 text-sm border-transparent focus:border-brand-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topics Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredTopics.map(topic => (
              <button key={topic.id} onClick={() => setSelectedTopic(selectedTopic?.id === topic.id ? null : topic)}
                className={`glass rounded-2xl p-5 text-left card-hover relative group transition-all
                  ${selectedTopic?.id === topic.id ? 'border-brand-500/50 bg-brand-600/10' : ''}`}
                style={{ borderColor: selectedTopic?.id === topic.id ? topic.color + '80' : '' }}>
                <div className="text-3xl mb-3">{topic.icon}</div>
                <h3 className="font-semibold text-white text-sm mb-1">{topic.name}</h3>
                <p className="text-xs text-slate-500">{topic.note_count} notes</p>
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full" style={{ background: topic.color }} />
                <button onClick={(e) => { e.stopPropagation(); handleDelete(topic.id); }}
                  className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </button>
            ))}

            {filteredTopics.length === 0 && (
              <div className="col-span-3 flex flex-col items-center justify-center py-20 text-slate-500">
                <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm">No topics yet. Create your first one!</p>
              </div>
            )}
          </div>

          {/* Notes panel */}
          <div className="glass rounded-2xl p-5">
            {selectedTopic ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{selectedTopic.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white">{selectedTopic.name}</h3>
                    <p className="text-xs text-slate-500">{topicNotes.length} notes</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {topicNotes.length ? topicNotes.map(note => (
                    <Link key={note.id} href={`/upload`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-800/50 transition-colors">
                      <FileText className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{note.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${note.status === 'processed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {note.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )) : (
                    <p className="text-sm text-slate-500 py-8 text-center">No notes in this topic yet.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-48 text-slate-500">
                <Tag className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Select a topic to view notes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-3xl p-8 w-full max-w-md neon-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create Topic</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Topic name"
                className="w-full px-4 py-3 bg-surface-900 border border-surface-700 rounded-xl text-white placeholder-slate-500 text-sm focus:border-brand-500 transition-colors" />
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Description (optional)" rows={3}
                className="w-full px-4 py-3 bg-surface-900 border border-surface-700 rounded-xl text-white placeholder-slate-500 text-sm resize-none focus:border-brand-500 transition-colors" />
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Choose icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setForm(p => ({ ...p, icon }))}
                      className={`w-10 h-10 rounded-xl text-xl transition-all ${form.icon === icon ? 'bg-brand-600/30 border border-brand-500' : 'bg-surface-800 hover:bg-surface-700'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Choose color</label>
                <div className="flex gap-2">
                  {COLORS.map(color => (
                    <button key={color} type="button" onClick={() => setForm(p => ({ ...p, color }))}
                      className={`w-8 h-8 rounded-full transition-all ${form.color === color ? 'scale-125 ring-2 ring-white/40' : ''}`}
                      style={{ background: color }} />
                  ))}
                </div>
              </div>
              <button type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold transition-all">
                Create Topic
              </button>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
