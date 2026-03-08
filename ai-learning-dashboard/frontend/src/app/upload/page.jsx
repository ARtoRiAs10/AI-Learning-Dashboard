'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { AppLayout } from '@/components/AppLayout';
import { notesAPI, aiAPI, topicsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Upload, FileText, X, Sparkles, Loader2, CheckCircle, Tag } from 'lucide-react';
import { useEffect } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topicId, setTopicId] = useState('');
  const [topics, setTopics] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadedNote, setUploadedNote] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    topicsAPI.list().then(({ data }) => setTopics(data.results || data)).catch(() => {});
  }, []);

  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    if (f) {
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || (!file && !content)) {
      toast.error('Please provide a title and either a file or content.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      if (content) formData.append('content', content);
      if (file) formData.append('file', file);
      if (topicId) formData.append('topic', topicId);

      const { data } = await notesAPI.create(formData);
      setUploadedNote(data);
      toast.success('Notes uploaded successfully!');
    } catch (err) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAIProcess = async () => {
    if (!uploadedNote) return;
    setProcessing(true);
    try {
      const { data } = await aiAPI.summarize(uploadedNote.id);
      setAiResult(data);
      toast.success('AI processing complete! ✨');
    } catch {
      toast.error('AI processing failed. Check your API key.');
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!uploadedNote) return;
    setProcessing(true);
    try {
      const { data } = await aiAPI.generateFlashcards(uploadedNote.id, 10);
      toast.success(`Generated ${data.count} flashcards! 🃏`);
    } catch {
      toast.error('Failed to generate flashcards.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Upload Notes</h1>
          <p className="text-slate-400">Upload your study materials and let AI do the heavy lifting.</p>
        </div>

        {!uploadedNote ? (
          <form onSubmit={handleUpload} className="space-y-5">
            <div className="glass rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                <input
                  value={title} onChange={e => setTitle(e.target.value)} required
                  placeholder="e.g., Chapter 5 - Cell Biology"
                  className="w-full px-4 py-3 bg-surface-900/80 border border-surface-700 rounded-xl text-white placeholder-slate-500 focus:border-brand-500 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Topic</label>
                <select value={topicId} onChange={e => setTopicId(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-900/80 border border-surface-700 rounded-xl text-white focus:border-brand-500 transition-colors text-sm">
                  <option value="">No topic</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                </select>
              </div>

              {/* Dropzone */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Upload File (PDF or TXT)</label>
                <div {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                    ${isDragActive ? 'border-brand-400 bg-brand-600/10' : 'border-surface-600 hover:border-brand-500/50 hover:bg-surface-800/30'}`}>
                  <input {...getInputProps()} />
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-brand-400" />
                      <div className="text-left">
                        <p className="text-white font-medium">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="ml-4 text-slate-500 hover:text-red-400">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-300 font-medium">Drop file here or click to browse</p>
                      <p className="text-xs text-slate-500 mt-1">PDF, TXT up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Or paste your notes directly</label>
                <textarea
                  value={content} onChange={e => setContent(e.target.value)} rows={8}
                  placeholder="Paste your notes, lecture transcript, or any text content here..."
                  className="w-full px-4 py-3 bg-surface-900/80 border border-surface-700 rounded-xl text-white placeholder-slate-500 focus:border-brand-500 transition-colors text-sm resize-none"
                />
              </div>
            </div>

            <button type="submit" disabled={uploading}
              className="w-full py-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {uploading ? 'Uploading...' : 'Upload Notes'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Success state */}
            <div className="glass rounded-2xl p-6 border border-green-500/30">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h2 className="text-lg font-semibold text-white">Notes Uploaded!</h2>
              </div>
              <p className="text-slate-300 font-medium">{uploadedNote.title}</p>
              <p className="text-sm text-slate-500 mt-1">{uploadedNote.word_count} words</p>
            </div>

            {/* AI Processing */}
            {!aiResult ? (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Process with AI</h3>
                <p className="text-sm text-slate-400 mb-5">Generate summary, key concepts, and tags automatically.</p>
                <button onClick={handleAIProcess} disabled={processing}
                  className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 disabled:opacity-60 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all">
                  {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {processing ? 'AI Processing...' : 'Summarize & Extract Key Concepts'}
                </button>
              </div>
            ) : (
              <div className="glass rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-400" /> AI Results
                </h3>
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Summary</h4>
                  <p className="text-slate-300 text-sm leading-relaxed bg-surface-900/50 rounded-xl p-4">{aiResult.summary}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {aiResult.tags?.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-brand-600/20 text-brand-300 rounded-full text-xs">
                        <Tag className="w-3 h-3" />{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Generate Flashcards */}
            <button onClick={handleGenerateFlashcards} disabled={processing}
              className="w-full py-4 glass hover:border-brand-500/40 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all">
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : '🃏'}
              Generate Flashcards
            </button>

            {/* Upload another */}
            <button onClick={() => { setUploadedNote(null); setAiResult(null); setFile(null); setTitle(''); setContent(''); }}
              className="w-full py-3 text-slate-400 hover:text-white text-sm transition-colors">
              Upload another note →
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
