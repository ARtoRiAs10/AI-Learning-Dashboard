'use client';
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { notesAPI, aiAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { CreditCard, ChevronLeft, ChevronRight, Check, X, Sparkles, Loader2, RotateCcw } from 'lucide-react';

export default function FlashcardsPage() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    notesAPI.list({ status: 'processed' })
      .then(({ data }) => setNotes(data.results || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadFlashcards = async (noteId) => {
    setLoading(true);
    try {
      const { data } = await notesAPI.getFlashcards(noteId);
      const cards = data.results || data;
      if (cards.length === 0) {
        toast('No flashcards yet. Generate some first!', { icon: '💡' });
      }
      setFlashcards(cards);
      setCurrentIdx(0);
      setFlipped(false);
      setSessionStats({ correct: 0, incorrect: 0 });
      setCompleted(false);
    } catch {
      toast.error('Failed to load flashcards.');
    } finally {
      setLoading(false);
    }
  };

  const handleNoteSelect = (note) => {
    setSelectedNote(note);
    loadFlashcards(note.id);
  };

  const handleGenerate = async () => {
    if (!selectedNote) return;
    setGenerating(true);
    try {
      const { data } = await aiAPI.generateFlashcards(selectedNote.id, 10);
      setFlashcards(data.flashcards);
      setCurrentIdx(0);
      setFlipped(false);
      setCompleted(false);
      toast.success(`Generated ${data.count} flashcards! ✨`);
    } catch {
      toast.error('Failed to generate flashcards.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = async (correct) => {
    const card = flashcards[currentIdx];
    try {
      await notesAPI.reviewFlashcard(card.id, correct);
    } catch {}

    setSessionStats(p => ({
      correct: correct ? p.correct + 1 : p.correct,
      incorrect: correct ? p.incorrect : p.incorrect + 1,
    }));

    if (currentIdx + 1 >= flashcards.length) {
      setCompleted(true);
    } else {
      setCurrentIdx(p => p + 1);
      setFlipped(false);
    }
  };

  const difficulty = { easy: 'text-green-400 bg-green-500/20', medium: 'text-yellow-400 bg-yellow-500/20', hard: 'text-red-400 bg-red-500/20' };

  const currentCard = flashcards[currentIdx];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Flashcards</h1>
            <p className="text-slate-400">Review and memorize key concepts.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Note selector */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Your Notes</h2>
            {loading && !notes.length ? (
              <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-12 shimmer rounded-xl" />)}</div>
            ) : notes.length ? (
              <div className="space-y-2">
                {notes.map(note => (
                  <button key={note.id} onClick={() => handleNoteSelect(note)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all
                      ${selectedNote?.id === note.id ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30' : 'text-slate-400 hover:text-white hover:bg-surface-800/50'}`}>
                    <p className="font-medium truncate">{note.title}</p>
                    <p className="text-xs opacity-60 mt-0.5">{note.flashcard_count} cards</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">Upload and process notes first.</p>
            )}
          </div>

          {/* Flashcard area */}
          <div className="lg:col-span-3">
            {!selectedNote ? (
              <div className="glass rounded-2xl flex flex-col items-center justify-center py-32 text-slate-500">
                <CreditCard className="w-20 h-20 mb-4 opacity-20" />
                <p className="text-lg">Select a note to study flashcards</p>
              </div>
            ) : completed ? (
              <div className="glass rounded-2xl p-12 text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-2xl font-bold text-white mb-2">Session Complete!</h2>
                <p className="text-slate-400 mb-8">You reviewed all {flashcards.length} cards.</p>
                <div className="flex justify-center gap-8 mb-10">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{sessionStats.correct}</div>
                    <div className="text-sm text-slate-500">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-400">{sessionStats.incorrect}</div>
                    <div className="text-sm text-slate-500">Incorrect</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-brand-400">
                      {Math.round((sessionStats.correct / flashcards.length) * 100)}%
                    </div>
                    <div className="text-sm text-slate-500">Accuracy</div>
                  </div>
                </div>
                <button onClick={() => { setCurrentIdx(0); setFlipped(false); setCompleted(false); setSessionStats({ correct: 0, incorrect: 0 }); }}
                  className="flex items-center gap-2 mx-auto px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold transition-all">
                  <RotateCcw className="w-4 h-4" /> Study Again
                </button>
              </div>
            ) : flashcards.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <CreditCard className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <h2 className="text-xl font-semibold text-white mb-2">No flashcards yet</h2>
                <p className="text-slate-400 mb-6">Generate AI-powered flashcards from your notes.</p>
                <button onClick={handleGenerate} disabled={generating}
                  className="flex items-center gap-2 mx-auto px-8 py-3 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-xl font-semibold transition-all">
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {generating ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Progress */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-surface-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${((currentIdx) / flashcards.length) * 100}%` }} />
                  </div>
                  <span className="text-sm text-slate-400 font-mono">{currentIdx + 1}/{flashcards.length}</span>
                  <button onClick={handleGenerate} disabled={generating}
                    className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg text-xs text-brand-400 hover:text-brand-300 transition-colors">
                    {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Regenerate
                  </button>
                </div>

                {/* Card */}
                <div onClick={() => setFlipped(!flipped)}
                  className="relative cursor-pointer h-72 glass rounded-3xl neon-border overflow-hidden"
                  style={{ perspective: '1000px' }}>
                  <div className={`absolute inset-0 p-8 flex flex-col items-center justify-center text-center transition-all duration-500`}
                    style={{ backfaceVisibility: 'hidden', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transformStyle: 'preserve-3d' }}>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Question</div>
                    <p className="text-xl font-semibold text-white leading-relaxed">{currentCard?.front}</p>
                    <p className="text-xs text-slate-500 mt-6">Click to reveal answer</p>
                  </div>
                  <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-brand-900/50 to-purple-900/30"
                    style={{ backfaceVisibility: 'hidden', transform: flipped ? 'rotateY(0deg)' : 'rotateY(-180deg)', transformStyle: 'preserve-3d' }}>
                    <div className="text-xs font-medium text-brand-400 uppercase tracking-wider mb-4">Answer</div>
                    <p className="text-lg text-white leading-relaxed">{currentCard?.back}</p>
                    <span className={`mt-4 text-xs px-3 py-1 rounded-full font-medium ${difficulty[currentCard?.difficulty] || ''}`}>
                      {currentCard?.difficulty}
                    </span>
                  </div>
                </div>

                {/* Answer buttons */}
                {flipped && (
                  <div className="flex gap-4">
                    <button onClick={() => handleAnswer(false)}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-2xl font-semibold transition-all">
                      <X className="w-5 h-5" /> Didn't Know
                    </button>
                    <button onClick={() => handleAnswer(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-2xl font-semibold transition-all">
                      <Check className="w-5 h-5" /> Got It!
                    </button>
                  </div>
                )}

                {/* Session stats */}
                <div className="flex gap-4 text-sm">
                  <span className="text-green-400">✓ {sessionStats.correct} correct</span>
                  <span className="text-red-400">✗ {sessionStats.incorrect} incorrect</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
