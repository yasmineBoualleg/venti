from django.db import models
from django.conf import settings
from core.models import UserStampedModel

class Event(UserStampedModel):
    """Model for club events."""
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]

    VISIBILITY_CHOICES = [
        ('PUBLIC', 'Public'),
        ('CLUB_MEMBERS', 'Club Members Only'),
        ('PRIVATE', 'Private'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Date and time
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    registration_deadline = models.DateTimeField(null=True, blank=True)
    
    # Location
    location = models.CharField(max_length=255)
    is_online = models.BooleanField(default=False)
    meeting_link = models.URLField(blank=True, null=True)
    
    # Event details
    max_participants = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='PUBLIC')
    cover_image = models.ImageField(upload_to='event_covers/', null=True, blank=True)
    
    # Engagement
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='EventParticipant',
        related_name='participated_events'
    )
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_events', blank=True)
    is_featured = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['start_date', 'status']),
        ]

    def __str__(self):
        return self.title

    @property
    def is_past(self):
        from django.utils import timezone
        return self.end_date < timezone.now()

    @property
    def is_ongoing(self):
        from django.utils import timezone
        now = timezone.now()
        return self.start_date <= now <= self.end_date

    @property
    def can_register(self):
        from django.utils import timezone
        if self.registration_deadline:
            return timezone.now() <= self.registration_deadline
        return timezone.now() <= self.start_date

class EventParticipant(models.Model):
    """Through model for event participation with additional fields."""
    STATUS_CHOICES = [
        ('REGISTERED', 'Registered'),
        ('WAITLISTED', 'Waitlisted'),
        ('CANCELLED', 'Cancelled'),
        ('ATTENDED', 'Attended'),
    ]

    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REGISTERED')
    registration_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['event', 'user']
        ordering = ['registration_date']

    def __str__(self):
        return f"{self.user.username} - {self.event.title}" 