from django.urls import path
from .views import TopicListCreateView, TopicDetailView

urlpatterns = [
    path('', TopicListCreateView.as_view(), name='topic-list'),
    path('<int:pk>/', TopicDetailView.as_view(), name='topic-detail'),
]
