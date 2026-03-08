import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'LearnAI - AI-Powered Learning Dashboard',
  description: 'Upload notes, generate flashcards, quizzes, and personalized study plans with AI.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-surface-950 text-slate-100 font-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '12px',
              fontFamily: 'Sora, sans-serif',
            },
            success: { iconTheme: { primary: '#818cf8', secondary: '#0f172a' } },
            error: { iconTheme: { primary: '#fb7185', secondary: '#0f172a' } },
          }}
        />
      </body>
    </html>
  );
}
