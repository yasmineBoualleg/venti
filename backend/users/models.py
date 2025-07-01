from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
import json

class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    """
    email = models.EmailField(_('email address'), unique=True)
    firebase_uid = models.CharField(max_length=128, unique=True, null=True, blank=True)
    place = models.CharField(max_length=255, null=True, blank=True, help_text=_('User location/place for location-based features'))
    
    # Make email the username field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
        
    def __str__(self):
        return self.email

class Profile(models.Model):
    """
    Extended user profile with XP, skills, interests, and collaboration data.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    xp = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    skills = models.JSONField(default=list, help_text=_('List of user skills'))
    interests = models.JSONField(default=list, help_text=_('List of user interests'))
    hobbies = models.JSONField(default=list, help_text=_('List of user hobbies'))
    bio = models.TextField(blank=True, help_text=_('User biography'))
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    badges = models.JSONField(default=list, help_text=_('List of earned badges'))
    
    # ManyToMany fields for future models
    # clubs_joined = models.ManyToManyField('Club', blank=True, related_name='members')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Profile')
        verbose_name_plural = _('Profiles')
    
    def __str__(self):
        return f"{self.user.email}'s Profile"
    
    def add_xp(self, amount):
        """Add XP to the profile."""
        self.xp += amount
        self.save()
    
    def add_badge(self, badge):
        """Add a badge if not already present."""
        if badge not in self.badges:
            self.badges.append(badge)
            self.save()
    
    def get_skill_level(self, skill):
        """Get the level of a specific skill based on collaborations."""
        from .models import PastCollaboration
        
        collaborations = PastCollaboration.objects.filter(
            models.Q(user_a=self.user) | models.Q(user_b=self.user),
            skill_used=skill
        ).count()
        
        if collaborations >= 10:
            return "Expert"
        elif collaborations >= 5:
            return "Advanced"
        elif collaborations >= 2:
            return "Intermediate"
        else:
            return "Beginner"

class CollabRequest(models.Model):
    """
    Collaboration request between users.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    ]
    
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_collabs')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_collabs')
    message = models.TextField(blank=True, help_text=_('Collaboration request message'))
    skill_focus = models.CharField(max_length=100, help_text=_('Primary skill for collaboration'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Collaboration Request')
        verbose_name_plural = _('Collaboration Requests')
        unique_together = ['from_user', 'to_user', 'skill_focus']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.from_user.email} → {self.to_user.email} ({self.skill_focus})"
    
    def accept(self):
        """Accept the collaboration request."""
        self.status = 'accepted'
        self.save()
        
        # Add XP to both users
        self.from_user.profile.add_xp(20)
        self.to_user.profile.add_xp(20)
        
        # Create PastCollaboration record
        PastCollaboration.objects.create(
            user_a=self.from_user,
            user_b=self.to_user,
            skill_used=self.skill_focus,
            collab_type='request'
        )
        
        # Check for frequent collaborator badge
        self._check_frequent_collaborator_badge()
    
    def decline(self):
        """Decline the collaboration request."""
        self.status = 'declined'
        self.save()
    
    def _check_frequent_collaborator_badge(self):
        """Check if users should get frequent collaborator badge."""
        from_user_collabs = PastCollaboration.objects.filter(
            models.Q(user_a=self.from_user) | models.Q(user_b=self.from_user)
        ).count()
        
        to_user_collabs = PastCollaboration.objects.filter(
            models.Q(user_a=self.to_user) | models.Q(user_b=self.to_user)
        ).count()
        
        if from_user_collabs >= 3:
            self.from_user.profile.add_badge("🔥 Frequent Collaborator")
        
        if to_user_collabs >= 3:
            self.to_user.profile.add_badge("🔥 Frequent Collaborator")

class PastCollaboration(models.Model):
    """
    Record of past collaborations between users.
    """
    COLLAB_TYPE_CHOICES = [
        ('notebook', 'Notebook'),
        ('event', 'Event'),
        ('post', 'Post'),
        ('request', 'Request'),
        ('study_group', 'Study Group'),
        ('project', 'Project'),
    ]
    
    user_a = models.ForeignKey(User, on_delete=models.CASCADE, related_name='collaborations_a')
    user_b = models.ForeignKey(User, on_delete=models.CASCADE, related_name='collaborations_b')
    skill_used = models.CharField(max_length=100, help_text=_('Skill used in collaboration'))
    collab_type = models.CharField(max_length=20, choices=COLLAB_TYPE_CHOICES, default='request')
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('Past Collaboration')
        verbose_name_plural = _('Past Collaborations')
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user_a.email} + {self.user_b.email} ({self.skill_used})"
    
    @classmethod
    def get_collaboration_count(cls, user1, user2):
        """Get the number of collaborations between two users."""
        return cls.objects.filter(
            models.Q(user_a=user1, user_b=user2) | 
            models.Q(user_a=user2, user_b=user1)
        ).count() 