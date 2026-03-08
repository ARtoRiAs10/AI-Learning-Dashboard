'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/lib/store';
import { Brain, Zap, BookOpen, BarChart3, ArrowRight, Star } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI-Powered Summaries', desc: 'Upload any notes and get instant, intelligent summaries powered by Claude AI.' },
  { icon: Zap, title: 'Smart Flashcards', desc: 'Auto-generate flashcards with spaced repetition to maximize retention.' },
  { icon: BookOpen, title: 'Custom Quizzes', desc: 'Test your knowledge with AI-crafted multiple-choice quizzes on any topic.' },
  { icon: BarChart3, title: 'Progress Analytics', desc: 'Track your learning streak, study time, and quiz performance over time.' },
];

export default function HomePage() {
  const { isAuthenticated, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initialize().then(() => {
      if (isAuthenticated) router.push('/dashboard');
    });
  }, []);

  return (
    <div className="min-h-screen bg-surface-950 overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-pink-600/5 rounded-full blur-[80px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">LearnAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth" className="text-slate-400 hover:text-white transition-colors text-sm">Sign In</Link>
          <Link href="/auth?mode=register"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:shadow-brand-600/25">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-brand-300 mb-8">
          <Star className="w-4 h-4 fill-current" />
          <span>AI-Powered Education Platform</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6">
          Learn Smarter with<br />
          <span className="gradient-text">AI-Powered Notes</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your study materials and let AI generate summaries, flashcards,
          quizzes, and personalized study plans — all in seconds.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/auth?mode=register"
            className="flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-semibold text-lg transition-all hover:shadow-xl hover:shadow-brand-600/30 hover:-translate-y-0.5">
            Start Learning for Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/auth"
            className="flex items-center gap-2 px-8 py-4 glass hover:border-brand-500/40 text-slate-300 rounded-2xl font-semibold text-lg transition-all hover:-translate-y-0.5">
            Sign In
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-28">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass rounded-2xl p-6 text-left card-hover">
              <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-brand-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
