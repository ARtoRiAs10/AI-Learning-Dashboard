from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Note, Flashcard
from .serializers import (
    NoteListSerializer, NoteDetailSerializer,
    NoteCreateSerializer, FlashcardSerializer
)
import PyPDF2
import io


def extract_text_from_file(file_obj, file_type):
    """Extract text content from uploaded file."""
    try:
        if file_type == 'application/pdf':
            reader = PyPDF2.PdfReader(file_obj)
            text = ' '.join(page.extract_text() for page in reader.pages)
            return text
        elif file_type in ['text/plain']:
            return file_obj.read().decode('utf-8')
        else:
            return ""
    except Exception:
        return ""


class NoteListCreateView(generics.ListCreateAPIView):
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return NoteCreateSerializer
        return NoteListSerializer

    def get_queryset(self):
        queryset = Note.objects.filter(user=self.request.user)
        topic = self.request.query_params.get('topic')
        status_filter = self.request.query_params.get('status')
        search = self.request.query_params.get('search')

        if topic:
            queryset = queryset.filter(topic_id=topic)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if search:
            queryset = queryset.filter(title__icontains=search)
        return queryset

    def perform_create(self, serializer):
        file = self.request.FILES.get('file')
        file_type = ''
        content = serializer.validated_data.get('content', '')

        if file:
            file_type = file.content_type
            if not content:
                content = extract_text_from_file(file, file_type)

        note = serializer.save(
            user=self.request.user,
            file_type=file_type,
            content=content,
            word_count=len(content.split()) if content else 0
        )
        return note


class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NoteDetailSerializer

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)


class FlashcardListView(generics.ListAPIView):
    serializer_class = FlashcardSerializer

    def get_queryset(self):
        return Flashcard.objects.filter(
            user=self.request.user,
            note_id=self.kwargs.get('note_id')
        )


class FlashcardReviewView(APIView):
    """Record flashcard review result."""

    def post(self, request, pk):
        flashcard = get_object_or_404(Flashcard, pk=pk, user=request.user)
        correct = request.data.get('correct', False)

        flashcard.times_reviewed += 1
        if correct:
            flashcard.times_correct += 1

        flashcard.last_reviewed = timezone.now()

        # Simple spaced repetition: schedule next review
        if correct:
            if flashcard.times_reviewed < 3:
                days = 1
            elif flashcard.times_reviewed < 6:
                days = 3
            else:
                days = 7
        else:
            days = 0  # Review again soon

        from datetime import timedelta
        flashcard.next_review = timezone.now() + timedelta(days=days)
        flashcard.save()

        return Response({
            'id': flashcard.id,
            'correct': correct,
            'accuracy': flashcard.accuracy,
            'times_reviewed': flashcard.times_reviewed,
            'next_review': flashcard.next_review
        })


class DueFlashcardsView(generics.ListAPIView):
    """Get flashcards due for review."""
    serializer_class = FlashcardSerializer

    def get_queryset(self):
        return Flashcard.objects.filter(
            user=self.request.user,
            next_review__lte=timezone.now()
        ).order_by('next_review')[:20]
