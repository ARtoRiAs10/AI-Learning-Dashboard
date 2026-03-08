'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { isAuthenticated, initialize, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initialize().then(() => {
      const state = useAuthStore.getState();
      if (!state.isAuthenticated) router.push('/auth');
    });
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-950">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        <div className="p-8 page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
