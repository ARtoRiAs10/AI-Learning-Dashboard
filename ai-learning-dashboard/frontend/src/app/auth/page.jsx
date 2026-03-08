'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '@/lib/store';
import toast from 'react-hot-toast';
import { Brain, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', password_confirm: '', username: '', first_name: '' });
  const { login, register, loading, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => { if (isAuthenticated) router.push('/dashboard'); }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'register') {
      const result = await register(form);
      if (result.success) {
        toast.success('Account created! Welcome to LearnAI 🎉');
        router.push('/dashboard');
      } else {
        const msg = Object.values(result.error || {}).flat().join(', ');
        toast.error(msg || 'Registration failed');
      }
    } else {
      const result = await login({ email: form.email, password: form.password });
      if (result.success) {
        toast.success('Welcome back!');
        router.push('/dashboard');
      } else {
        toast.error('Invalid email or password');
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-[30%] w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-[20%] w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[80px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8 neon-border">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">LearnAI</h1>
              <p className="text-xs text-slate-500">{mode === 'login' ? 'Welcome back' : 'Create your account'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <input
                  type="text" required placeholder="Full Name"
                  value={form.first_name}
                  onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                  className="w-full px-4 py-3 bg-surface-900/80 border border-surface-700 rounded-xl text-white placeholder-slate-500 focus:border-brand-500 transition-colors text-sm"
                />
                <input
                  type="text" required placeholder="Username"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  className="w-full px-4 py-3 bg-surface-900/80 border border-surface-700 rounded-xl text-white placeholder-slate-500 focus:border-brand-500 transition-colors text-sm"
                />
              </>
            )}

            <input
              type="email" required placeholder="Email address"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full px-4 py-3 bg-surface-900/80 border border-surface-700 rounded-xl text-white placeholder-slate-500 focus:border-brand-500 transition-colors text-sm"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} required placeholder="Password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-3 bg-surface-900/80 border border-surface-700 rounded-xl text-white placeholder-slate-500 focus:border-brand-500 transition-colors text-sm pr-12"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {mode === 'register' && (
              <input
                type="password" required placeholder="Confirm Password"
                value={form.password_confirm}
                onChange={e => setForm(p => ({ ...p, password_confirm: e.target.value }))}
                className="w-full px-4 py-3 bg-surface-900/80 border border-surface-700 rounded-xl text-white placeholder-slate-500 focus:border-brand-500 transition-colors text-sm"
              />
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-brand-400 hover:text-brand-300 font-medium">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
