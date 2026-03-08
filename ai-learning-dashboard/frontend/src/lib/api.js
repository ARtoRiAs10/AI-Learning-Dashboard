import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = Cookies.get('refresh_token');
        const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh });
        Cookies.set('access_token', data.access, { expires: 1 });
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refresh_token) => api.post('/auth/logout/', { refresh_token }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
};

// ─── Notes ───────────────────────────────────────────────────────────────────
export const notesAPI = {
  list: (params) => api.get('/notes/', { params }),
  get: (id) => api.get(`/notes/${id}/`),
  create: (data) => api.post('/notes/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.patch(`/notes/${id}/`, data),
  delete: (id) => api.delete(`/notes/${id}/`),
  getFlashcards: (noteId) => api.get(`/notes/${noteId}/flashcards/`),
  getDueFlashcards: () => api.get('/notes/flashcards/due/'),
  reviewFlashcard: (id, correct) => api.post(`/notes/flashcards/${id}/review/`, { correct }),
};

// ─── AI Engine ────────────────────────────────────────────────────────────────
export const aiAPI = {
  summarize: (noteId) => api.post(`/ai/notes/${noteId}/summarize/`),
  generateFlashcards: (noteId, count = 10) =>
    api.post(`/ai/notes/${noteId}/flashcards/`, { count }),
  generateQuiz: (noteId, count = 5) =>
    api.post(`/ai/notes/${noteId}/quiz/`, { count }),
  generateStudyPlan: (data) => api.post('/ai/study-plan/', data),
  explain: (concept, noteId = null, level = 'intermediate') =>
    api.post('/ai/explain/', { concept, note_id: noteId, level }),
  chat: (messages, noteId = null) =>
    api.post('/ai/chat/', { messages, note_id: noteId }),
};

// ─── Topics ──────────────────────────────────────────────────────────────────
export const topicsAPI = {
  list: () => api.get('/topics/'),
  create: (data) => api.post('/topics/', data),
  update: (id, data) => api.patch(`/topics/${id}/`, data),
  delete: (id) => api.delete(`/topics/${id}/`),
};

// ─── Progress ─────────────────────────────────────────────────────────────────
export const progressAPI = {
  getStats: () => api.get('/progress/stats/'),
  createSession: (data) => api.post('/progress/sessions/', data),
  saveQuizResult: (data) => api.post('/progress/quiz-results/', data),
  getQuizHistory: () => api.get('/progress/quiz-history/'),
};

export default api;
