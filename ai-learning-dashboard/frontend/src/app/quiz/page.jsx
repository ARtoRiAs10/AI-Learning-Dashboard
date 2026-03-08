'use client';
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { notesAPI, aiAPI, progressAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Trophy, Sparkles, CheckCircle, XCircle, Loader2, ChevronRight, RotateCcw } from 'lucide-react';

const QUESTION_COUNTS = [3, 5, 10];

export default function QuizPage() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(null);

  useEffect(() => {
    notesAPI.list({ status: 'processed' })
      .then(({ data }) => setNotes(data.results || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateQuiz = async () => {
    if (!selectedNote) { toast.error('Select a note first.'); return; }
    setGenerating(true);
    try {
      const { data } = await aiAPI.generateQuiz(selectedNote.id, questionCount);
      setQuiz(data);
      setAnswers({});
      setSubmitted(false);
      setScore(null);
      toast.success('Quiz generated! ✨');
    } catch {
      toast.error('Failed to generate quiz. Check your API key.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    const unanswered = quiz.questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      toast.error(`Please answer all ${unanswered.length} remaining questions.`);
      return;
    }

    let correct = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) correct++;
    });

    const scoreVal = Math.round((correct / quiz.questions.length) * 100);
    setScore({ correct, total: quiz.questions.length, percentage: scoreVal });
    setSubmitted(true);

    // Save result
    try {
      await progressAPI.saveQuizResult({
        note: selectedNote.id,
        quiz_title: quiz.title,
        score: scoreVal,
        total_questions: quiz.questions.length,
        correct_answers: correct,
        answers: answers,
      });
    } catch {}
  };

  const handleReset = () => {
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  const getOptionStyle = (questionId, optionId, correctAnswer) => {
    if (!submitted) {
      return answers[questionId] === optionId
        ? 'border-brand-500 bg-brand-600/20 text-white'
        : 'border-surface-700 text-slate-400 hover:border-brand-500/50 hover:text-white';
    }
    if (optionId === correctAnswer) return 'border-green-500 bg-green-500/20 text-green-300';
    if (answers[questionId] === optionId && optionId !== correctAnswer) return 'border-red-500 bg-red-500/20 text-red-300';
    return 'border-surface-700 text-slate-500';
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quiz Mode</h1>
          <p className="text-slate-400">Test your knowledge with AI-generated quizzes.</p>
        </div>

        {/* Config panel */}
        {!quiz && (
          <div className="glass rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Select Note to Quiz On</label>
              {loading ? (
                <div className="h-12 shimmer rounded-xl" />
              ) : (
                <select value={selectedNote?.id || ''} onChange={e => setNotes(p => { const n = p.find(n => n.id == e.target.value); setSelectedNote(n); return p; })}
                  className="w-full px-4 py-3 bg-surface-900 border border-surface-700 rounded-xl text-white text-sm focus:border-brand-500 transition-colors">
                  <option value="">Choose a note...</option>
                  {notes.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Number of Questions</label>
              <div className="flex gap-3">
                {QUESTION_COUNTS.map(c => (
                  <button key={c} onClick={() => setQuestionCount(c)}
                    className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all
                      ${questionCount === c ? 'bg-brand-600 text-white' : 'glass text-slate-400 hover:text-white'}`}>
                    {c} Questions
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleGenerateQuiz} disabled={generating || !selectedNote}
              className="w-full py-4 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all">
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {generating ? 'Generating Quiz...' : 'Generate Quiz with AI'}
            </button>
          </div>
        )}

        {/* Score result */}
        {submitted && score && (
          <div className={`rounded-2xl p-6 border text-center
            ${score.percentage >= 70 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="text-5xl mb-3">{score.percentage >= 70 ? '🏆' : '📚'}</div>
            <div className={`text-4xl font-bold mb-2 ${score.percentage >= 70 ? 'text-green-400' : 'text-red-400'}`}>
              {score.percentage}%
            </div>
            <p className="text-white font-semibold mb-1">{score.percentage >= 70 ? 'Great job!' : 'Keep studying!'}</p>
            <p className="text-slate-400 text-sm">{score.correct} out of {score.total} correct</p>
            <div className="flex gap-3 mt-5 justify-center">
              <button onClick={handleReset}
                className="flex items-center gap-2 px-6 py-2.5 glass rounded-xl text-white text-sm hover:border-brand-500/50 transition-all">
                <RotateCcw className="w-4 h-4" /> New Quiz
              </button>
              <button onClick={handleGenerateQuiz} disabled={generating}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 rounded-xl text-white text-sm transition-all">
                <Sparkles className="w-4 h-4" /> Retry
              </button>
            </div>
          </div>
        )}

        {/* Questions */}
        {quiz && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
                <p className="text-sm text-slate-400 mt-1">{quiz.description}</p>
              </div>
              {!submitted && (
                <span className="text-sm text-slate-500">
                  {Object.keys(answers).length}/{quiz.questions.length} answered
                </span>
              )}
            </div>

            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="glass rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-brand-600/20 flex items-center justify-center text-xs font-bold text-brand-400">
                    {idx + 1}
                  </span>
                  <p className="text-white font-medium leading-relaxed">{q.question}</p>
                </div>

                <div className="space-y-2 ml-10">
                  {q.options.map(opt => (
                    <button key={opt.id} onClick={() => !submitted && setAnswers(p => ({ ...p, [q.id]: opt.id }))}
                      disabled={submitted}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all
                        ${getOptionStyle(q.id, opt.id, q.correct_answer)}`}>
                      <span className="font-bold mr-3">{opt.id}.</span>{opt.text}
                    </button>
                  ))}
                </div>

                {submitted && (
                  <div className="ml-10 mt-3 flex items-start gap-2">
                    {answers[q.id] === q.correct_answer
                      ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                    <p className="text-sm text-slate-400">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}

            {!submitted && (
              <button onClick={handleSubmit}
                className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all">
                Submit Answers <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
