from rest_framework import serializers
from .models import Topic


class TopicSerializer(serializers.ModelSerializer):
    note_count = serializers.ReadOnlyField()

    class Meta:
        model = Topic
        fields = ['id', 'name', 'description', 'color', 'icon', 'note_count', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
