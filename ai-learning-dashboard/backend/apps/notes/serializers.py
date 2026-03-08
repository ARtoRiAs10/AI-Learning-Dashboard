from rest_framework import serializers
from .models import Note, Flashcard


class FlashcardSerializer(serializers.ModelSerializer):
    accuracy = serializers.ReadOnlyField()

    class Meta:
        model = Flashcard
        fields = [
            'id', 'note', 'front', 'back', 'difficulty',
            'times_reviewed', 'times_correct', 'accuracy',
            'last_reviewed', 'next_review', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'times_reviewed', 'times_correct', 'created_at']


class NoteListSerializer(serializers.ModelSerializer):
    flashcard_count = serializers.SerializerMethodField()
    topic_name = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = [
            'id', 'title', 'status', 'summary', 'tags',
            'topic', 'topic_name', 'word_count',
            'flashcard_count', 'created_at', 'updated_at'
        ]

    def get_flashcard_count(self, obj):
        return obj.flashcards.count()

    def get_topic_name(self, obj):
        return obj.topic.name if obj.topic else None


class NoteDetailSerializer(serializers.ModelSerializer):
    flashcards = FlashcardSerializer(many=True, read_only=True)
    flashcard_count = serializers.SerializerMethodField()
    topic_name = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = [
            'id', 'title', 'content', 'file', 'file_type', 'status',
            'summary', 'key_concepts', 'tags', 'topic', 'topic_name',
            'word_count', 'flashcards', 'flashcard_count', 'created_at', 'updated_at'
        ]

    def get_flashcard_count(self, obj):
        return obj.flashcards.count()

    def get_topic_name(self, obj):
        return obj.topic.name if obj.topic else None


class NoteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['title', 'content', 'file', 'topic', 'tags']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        if validated_data.get('content'):
            validated_data['word_count'] = len(validated_data['content'].split())
        return super().create(validated_data)
