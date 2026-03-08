# 🧠 AI Learning Dashboard

An AI-powered learning platform where users upload notes and the system
auto-generates summaries, flashcards, quizzes, and personalized study
plans — all powered by **OpenRouter** (Claude 3.5, GPT-4o, Gemini, Llama, and 200+ more models).

---

## 🏗️ Directory Structure

```
ai-learning-dashboard/
├── README.md
│
├── backend/                          ← Django 4.2 + DRF
│   ├── config/
│   │   ├── settings.py               ← JWT · CORS · OpenRouter config
│   │   ├── urls.py                   ← Root URL routing
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── users/                    ← Custom user model · JWT auth
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   ├── notes/                    ← Notes · Flashcards · spaced repetition
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   ├── ai_engine/                ← All AI features via OpenRouter
│   │   │   ├── services.py           ★ Core AI logic (OpenRouter SDK)
│   │   │   ├── views.py              ← REST endpoints
│   │   │   └── urls.py
│   │   ├── topics/                   ← Topics library
│   │   └── progress/                 ← Stats · sessions · quiz history
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                         ← Next.js 14 (App Router)
    ├── src/
    │   ├── app/
    │   │   ├── page.jsx              ← Landing page
    │   │   ├── auth/page.jsx         ← Login · Register
    │   │   ├── dashboard/page.jsx    ← Stats · charts · quick actions
    │   │   ├── upload/page.jsx       ← Drag-drop upload + AI processing
    │   │   ├── topics/page.jsx       ← Topics library
    │   │   ├── flashcards/page.jsx   ← Flip cards · spaced repetition
    │   │   ├── quiz/page.jsx         ← MCQ quiz · instant scoring
    │   │   └── study-plan/page.jsx   ← Personalized N-day schedule
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   └── AppLayout.jsx
    │   └── lib/
    │       ├── api.js                ← Axios + token refresh interceptor
    │       └── store.js              ← Zustand auth state
    ├── tailwind.config.js
    ├── next.config.js
    ├── package.json
    └── .env.local.example
```

---

## 🚀 Quick Start

### 1 — Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# ↳ Open .env and paste your OPENROUTER_API_KEY
#   Get a free key at https://openrouter.ai/keys

# Run migrations
python manage.py makemigrations
python manage.py migrate

# (Optional) Create admin superuser
python manage.py createsuperuser

# Start the API server
python manage.py runserver
# → API running at http://localhost:8000
```

### 2 — Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy env template
cp .env.local.example .env.local

# Start dev server
npm run dev
# → App running at http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend `.env`

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | Django secret key |
| `OPENROUTER_API_KEY` | ✅ | From [openrouter.ai/keys](https://openrouter.ai/keys) |
| `OPENROUTER_DEFAULT_MODEL` | ✅ | Model slug (see table below) |
| `DEBUG` | — | `True` for development |
| `CORS_ALLOWED_ORIGINS` | — | Frontend URL(s) |

### Frontend `.env.local`

| Variable | Default |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` |

---

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

---

## 📡 API Reference

```
# Auth
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/logout/
POST   /api/auth/token/refresh/
GET    /api/auth/profile/

# Notes
GET    /api/notes/
POST   /api/notes/
GET    /api/notes/{id}/
PATCH  /api/notes/{id}/
DELETE /api/notes/{id}/
GET    /api/notes/{id}/flashcards/
GET    /api/notes/flashcards/due/
POST   /api/notes/flashcards/{id}/review/

# AI Engine (OpenRouter)
POST   /api/ai/notes/{id}/summarize/
POST   /api/ai/notes/{id}/flashcards/
POST   /api/ai/notes/{id}/quiz/
POST   /api/ai/study-plan/
POST   /api/ai/explain/
POST   /api/ai/chat/

# Topics
GET    /api/topics/
POST   /api/topics/
PATCH  /api/topics/{id}/
DELETE /api/topics/{id}/

# Progress
GET    /api/progress/stats/
POST   /api/progress/sessions/
POST   /api/progress/quiz-results/
GET    /api/progress/quiz-history/
```

---

## 🎯 Resume Highlights

This project demonstrates:
- **Full-stack development** — Next.js 14 + Django REST Framework
- **AI integration** — OpenRouter unified API (swap models with one env var)
- **JWT authentication** — access/refresh token pattern with silent renewal
- **File processing** — PDF text extraction with PyPDF2
- **Spaced repetition** — Leitner-style flashcard scheduling algorithm
- **Real-time analytics** — Recharts dashboard with weekly activity
- **Modern UI/UX** — glassmorphism dark theme, CSS animations, Tailwind
