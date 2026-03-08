from django.db import models
from apps.users.models import CustomUser


class Topic(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#6366f1')  # Hex color
    icon = models.CharField(max_length=50, default='📚')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='topics')
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'topics'
        ordering = ['name']

    def __str__(self):
        return f"{self.user.email} - {self.name}"

    @property
    def note_count(self):
        return self.notes.count()
