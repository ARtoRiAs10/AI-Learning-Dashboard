from django.db import models
from apps.users.models import CustomUser
from apps.notes.models import Note


class StudySession(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='study_sessions')
    note = models.ForeignKey(Note, on_delete=models.SET_NULL, null=True, blank=True)
    session_type = models.CharField(
        max_length=20,
        choices=[
            ('reading', 'Reading'),
            ('flashcards', 'Flashcards'),
            ('quiz', 'Quiz'),
            ('study_plan', 'Study Plan'),
        ]
    )
    duration_minutes = models.IntegerField(default=0)
    score = models.IntegerField(null=True, blank=True)  # For quizzes (0-100)
    total_questions = models.IntegerField(null=True, blank=True)
    correct_answers = models.IntegerField(null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'study_sessions'
        ordering = ['-started_at']


class QuizResult(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='quiz_results')
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='quiz_results')
    session = models.ForeignKey(StudySession, on_delete=models.CASCADE, null=True)
    quiz_title = models.CharField(max_length=255)
    score = models.IntegerField()  # percentage 0-100
    total_questions = models.IntegerField()
    correct_answers = models.IntegerField()
    answers = models.JSONField(default=dict)  # Store answers for review
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'quiz_results'
        ordering = ['-created_at']

    @property
    def passed(self):
        return self.score >= 70
