from django.urls import path
from .views import (
    DashboardStatsView, StudySessionListCreateView,
    QuizResultCreateView, QuizResultListView
)

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('sessions/', StudySessionListCreateView.as_view(), name='study-sessions'),
    path('quiz-results/', QuizResultCreateView.as_view(), name='quiz-result-create'),
    path('quiz-history/', QuizResultListView.as_view(), name='quiz-history'),
]
