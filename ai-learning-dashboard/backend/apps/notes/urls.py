from django.urls import path
from .views import (
    NoteListCreateView, NoteDetailView,
    FlashcardListView, FlashcardReviewView, DueFlashcardsView
)

urlpatterns = [
    path('', NoteListCreateView.as_view(), name='note-list'),
    path('<int:pk>/', NoteDetailView.as_view(), name='note-detail'),
    path('<int:note_id>/flashcards/', FlashcardListView.as_view(), name='note-flashcards'),
    path('flashcards/due/', DueFlashcardsView.as_view(), name='due-flashcards'),
    path('flashcards/<int:pk>/review/', FlashcardReviewView.as_view(), name='flashcard-review'),
]
