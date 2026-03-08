from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Avg, Count
from django.utils import timezone
from datetime import timedelta
from apps.notes.models import Note, Flashcard
from .models import StudySession, QuizResult
from .serializers import StudySessionSerializer, QuizResultSerializer


class DashboardStatsView(APIView):
    """Aggregate stats for the dashboard."""

    def get(self, request):
        user = request.user
        now = timezone.now()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)

        # Notes stats
        total_notes = Note.objects.filter(user=user).count()
        processed_notes = Note.objects.filter(user=user, status='processed').count()

        # Flashcard stats
        total_flashcards = Flashcard.objects.filter(user=user).count()
        due_flashcards = Flashcard.objects.filter(
            user=user, next_review__lte=now
        ).count()

        # Study sessions
        total_study_time = StudySession.objects.filter(
            user=user
        ).aggregate(total=Sum('duration_minutes'))['total'] or 0

        weekly_study_time = StudySession.objects.filter(
            user=user,
            started_at__gte=week_ago
        ).aggregate(total=Sum('duration_minutes'))['total'] or 0

        # Quiz stats
        quiz_results = QuizResult.objects.filter(user=user)
        avg_quiz_score = quiz_results.aggregate(avg=Avg('score'))['avg'] or 0
        total_quizzes = quiz_results.count()

        # Activity by day (last 7 days)
        activity_data = []
        for i in range(7):
            day = now - timedelta(days=6 - i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)

            sessions = StudySession.objects.filter(
                user=user,
                started_at__range=[day_start, day_end]
            )
            activity_data.append({
                'date': day.strftime('%a'),
                'minutes': sessions.aggregate(total=Sum('duration_minutes'))['total'] or 0,
                'sessions': sessions.count()
            })

        # Recent quiz scores
        recent_quizzes = QuizResultSerializer(
            quiz_results.order_by('-created_at')[:5],
            many=True
        ).data

        return Response({
            'notes': {
                'total': total_notes,
                'processed': processed_notes,
                'pending': total_notes - processed_notes,
            },
            'flashcards': {
                'total': total_flashcards,
                'due': due_flashcards,
            },
            'study_time': {
                'total_minutes': total_study_time,
                'weekly_minutes': weekly_study_time,
            },
            'quizzes': {
                'total': total_quizzes,
                'avg_score': round(avg_quiz_score, 1),
            },
            'streak': user.learning_streak,
            'activity': activity_data,
            'recent_quizzes': recent_quizzes,
        })


class StudySessionListCreateView(generics.ListCreateAPIView):
    serializer_class = StudySessionSerializer

    def get_queryset(self):
        return StudySession.objects.filter(user=self.request.user)[:20]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class QuizResultCreateView(generics.CreateAPIView):
    serializer_class = QuizResultSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class QuizResultListView(generics.ListAPIView):
    serializer_class = QuizResultSerializer

    def get_queryset(self):
        return QuizResult.objects.filter(user=self.request.user)
