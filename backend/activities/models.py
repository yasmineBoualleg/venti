from django.db import models
from django.conf import settings

class Activity(models.Model):
    """Model for tracking user activities across the platform."""
    TYPE_CHOICES = [
        ('JOIN_CLUB', 'Joined a club'),
        ('CREATE_POST', 'Created a post'),
        ('COMMENT', 'Commented on a post'),
        ('LIKE_POST', 'Liked a post'),
        ('LIKE_COMMENT', 'Liked a comment'),
        ('VOTE_POLL', 'Voted on a poll'),
        ('ACHIEVEMENT', 'Earned an achievement'),
        ('LEVEL_UP', 'Leveled up'),
        ('UPDATE_PROFILE', 'Updated profile'),
        ('CREATE_CLUB', 'Created a club'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    target_id = models.PositiveIntegerField(null=True, blank=True)  # ID of the related object (post, comment, etc.)
    target_type = models.CharField(max_length=50, null=True, blank=True)  # Type of the related object
    data = models.JSONField(default=dict, blank=True)  # Additional activity-specific data
    created_at = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'activities'

    def __str__(self):
        return f"{self.user.username} - {self.get_type_display()}" 