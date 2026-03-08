from django.urls import path
from .views import (
    SummarizeNoteView, GenerateFlashcardsView,
    GenerateQuizView, GenerateStudyPlanView,
    ExplainConceptView, ChatWithNotesView
)

urlpatterns = [
    path('notes/<int:note_id>/summarize/', SummarizeNoteView.as_view(), name='summarize-note'),
    path('notes/<int:note_id>/flashcards/', GenerateFlashcardsView.as_view(), name='generate-flashcards'),
    path('notes/<int:note_id>/quiz/', GenerateQuizView.as_view(), name='generate-quiz'),
    path('study-plan/', GenerateStudyPlanView.as_view(), name='generate-study-plan'),
    path('explain/', ExplainConceptView.as_view(), name='explain-concept'),
    path('chat/', ChatWithNotesView.as_view(), name='chat-with-notes'),
]
