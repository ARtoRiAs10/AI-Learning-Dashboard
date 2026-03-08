# 🧠 AI Learning Dashboard

An AI-powered learning platform where users upload notes and the system
auto-generates summaries, flashcards, quizzes, and personalized study
plans — all powered by **OpenRouter** (Claude 3.5, GPT-4o, Gemini, Llama, and 200+ more models).


## 🤖 Choosing a Model (OpenRouter)

Set `OPENROUTER_DEFAULT_MODEL` in your `.env` to any model slug from
[openrouter.ai/models](https://openrouter.ai/models).

| Tier | Model Slug | Notes |
|------|-----------|-------|
| 🆓 Free | `google/gemma-2-9b-it:free` | Zero cost, good for dev |
| 🆓 Free | `mistralai/mistral-7b-instruct:free` | Fast & free |
| ⚡ Balanced | `google/gemini-flash-1.5` | Very fast, cheap |
| ⚡ Balanced | `meta-llama/llama-3.1-70b-instruct` | Open weights |
| 🏆 Best | `anthropic/claude-3.5-sonnet` | Recommended for prod |
| 🏆 Best | `openai/gpt-4o` | Great alternative |

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Note Upload** | Upload PDF / TXT or paste text directly |
| **AI Summarizer** | Auto-generate summary + key concepts + tags |
| **Smart Flashcards** | AI-created Q&A cards with spaced repetition scheduling |
| **Quiz Mode** | Multiple-choice quizzes with instant feedback & explanations |
| **Study Plan** | Personalized N-day schedule based on your notes |
| **Topics Library** | Organize notes by subject with custom icons & colors |
| **Progress Dashboard** | Streak, study time, weekly activity chart, quiz history |
| **AI Chat** | Ask questions about your notes (multi-turn) |
| **JWT Auth** | Secure login/register with silent token refresh |

---

## 🛠️ Tech Stack

**Frontend**
- Next.js 14 (App Router)
- Tailwind CSS — dark glassmorphism theme
- Recharts — analytics charts
- Zustand — global auth state
- React Dropzone — file upload UX
- Framer Motion — page animations

**Backend**
- Django 4.2 + Django REST Framework
- SimpleJWT — access + refresh tokens
- **OpenRouter** via `openai` SDK — AI features
- PyPDF2 — PDF text extraction
- SQLite (dev) / PostgreSQL (prod)
