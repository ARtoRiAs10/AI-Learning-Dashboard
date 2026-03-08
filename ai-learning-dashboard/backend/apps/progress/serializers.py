from rest_framework import serializers
from .models import StudySession, QuizResult


class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = '__all__'
        read_only_fields = ['id', 'user', 'started_at']


class QuizResultSerializer(serializers.ModelSerializer):
    passed = serializers.ReadOnlyField()

    class Meta:
        model = QuizResult
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']
