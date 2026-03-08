from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from apps.notes.models import Note, Flashcard
from apps.notes.serializers import FlashcardSerializer
from . import services
import json


class SummarizeNoteView(APIView):
    """Generate AI summary and key concepts for a note."""

    def post(self, request, note_id):
        note = get_object_or_404(Note, id=note_id, user=request.user)

        if not note.content:
            return Response(
                {'error': 'Note has no content to summarize.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            note.status = 'processing'
            note.save()

            result = services.summarize_notes(note.content)

            note.summary = result.get('summary', '')
            note.key_concepts = result.get('key_concepts', [])
            note.tags = result.get('tags', [])
            note.status = 'processed'
            note.save()

            return Response({
                'summary': note.summary,
                'key_concepts': note.key_concepts,
                'tags': note.tags,
            })
        except Exception as e:
            note.status = 'failed'
            note.save()
            return Response(
                {'error': f'AI processing failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GenerateFlashcardsView(APIView):
    """Generate flashcards from a note."""

    def post(self, request, note_id):
        note = get_object_or_404(Note, id=note_id, user=request.user)
        count = request.data.get('count', 10)

        if not note.content:
            return Response(
                {'error': 'Note has no content.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            flashcard_data = services.generate_flashcards(note.content, count=count)

            created_flashcards = []
            for fc in flashcard_data:
                flashcard = Flashcard.objects.create(
                    note=note,
                    user=request.user,
                    front=fc['front'],
                    back=fc['back'],
                    difficulty=fc.get('difficulty', 'medium')
                )
                created_flashcards.append(flashcard)

            serializer = FlashcardSerializer(created_flashcards, many=True)
            return Response({
                'flashcards': serializer.data,
                'count': len(created_flashcards)
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Failed to generate flashcards: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GenerateQuizView(APIView):
    """Generate a quiz from a note."""

    def post(self, request, note_id):
        note = get_object_or_404(Note, id=note_id, user=request.user)
        count = request.data.get('count', 5)

        if not note.content:
            return Response(
                {'error': 'Note has no content.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            quiz_data = services.generate_quiz(
                note.content,
                topic=note.title,
                count=count
            )
            return Response(quiz_data)
        except Exception as e:
            return Response(
                {'error': f'Failed to generate quiz: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GenerateStudyPlanView(APIView):
    """Generate a personalized study plan."""

    def post(self, request):
        days = request.data.get('days', 7)
        goals = request.data.get('goals', '')
        note_ids = request.data.get('note_ids', [])

        notes = Note.objects.filter(
            user=request.user,
            status='processed'
        )

        if note_ids:
            notes = notes.filter(id__in=note_ids)

        notes_summaries = [
            {'title': n.title, 'summary': n.summary or n.content[:500]}
            for n in notes[:10]
        ]

        if not notes_summaries:
            return Response(
                {'error': 'No processed notes found. Please upload and process notes first.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            study_plan = services.generate_study_plan(notes_summaries, goals, days)
            return Response(study_plan)
        except Exception as e:
            return Response(
                {'error': f'Failed to generate study plan: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ExplainConceptView(APIView):
    """AI explanation of a concept."""

    def post(self, request):
        concept = request.data.get('concept', '')
        level = request.data.get('level', 'intermediate')
        note_id = request.data.get('note_id')

        if not concept:
            return Response(
                {'error': 'Concept is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        context = ''
        if note_id:
            try:
                note = Note.objects.get(id=note_id, user=request.user)
                context = note.content
            except Note.DoesNotExist:
                pass

        try:
            result = services.explain_concept(concept, context, level)
            return Response(result)
        except Exception as e:
            return Response(
                {'error': f'Failed to explain concept: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChatWithNotesView(APIView):
    """Chat about notes content."""

    def post(self, request):
        messages = request.data.get('messages', [])
        note_id = request.data.get('note_id')

        if not messages:
            return Response(
                {'error': 'Messages are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        notes_content = ''
        if note_id:
            try:
                note = Note.objects.get(id=note_id, user=request.user)
                notes_content = note.content
            except Note.DoesNotExist:
                pass
        else:
            # Use all user's notes
            notes = Note.objects.filter(user=request.user).order_by('-created_at')[:5]
            notes_content = '\n\n---\n\n'.join(
                f"[{n.title}]\n{n.content}" for n in notes
            )

        try:
            response = services.chat_with_notes(messages, notes_content)
            return Response({'response': response})
        except Exception as e:
            return Response(
                {'error': f'Chat failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
