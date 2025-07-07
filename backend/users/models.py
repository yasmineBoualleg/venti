from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from django.utils import timezone
from datetime import timedelta
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

class XPLog(models.Model):
    """
    Log of XP gains with reasons and timestamps.
    """
    XP_REASONS = [
        ('signup', 'New User Signup'),
        ('profile_edit', 'Profile Edit'),
        ('daily_activity', 'Daily Activity (30+ min)'),
        ('session_activity', 'Session Activity (30+ min)'),
        ('collaboration', 'Collaboration'),
        ('feature_use', 'New Feature Usage'),
        ('admin_grant', 'Admin Grant'),
        ('comment', 'Comment Posted'),
        ('login_streak', 'Login Streak'),
        ('skill_added', 'Skill Added'),
        ('badge_earned', 'Badge Earned'),
    ]
    
    profile = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='xp_logs')
    amount = models.IntegerField(validators=[MinValueValidator(1)])
    reason = models.CharField(max_length=50, choices=XP_REASONS)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('XP Log')
        verbose_name_plural = _('XP Logs')
    
    def __str__(self):
        return f"{self.profile.user.email}: +{self.amount} XP ({self.reason})"

class UserActivity(models.Model):
    """
    Track user activity for XP rewards.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    session_start = models.DateTimeField(auto_now_add=True)
    session_end = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-session_start']
        verbose_name = _('User Activity')
        verbose_name_plural = _('User Activities')
    
    def __str__(self):
        return f"{self.user.email}: {self.duration_minutes}min session"

class Profile(models.Model):
    """
    Extended user profile with XP, skills, interests, and collaboration data.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    xp = models.IntegerField(default=10, validators=[MinValueValidator(0)])  # New users start with 10 XP
    level = models.IntegerField(default=1, validators=[MinValueValidator(1)])  # Current level
    skills = models.JSONField(default=list, help_text=_('List of user skills'))
    interests = models.JSONField(default=list, help_text=_('List of user interests'))
    hobbies = models.JSONField(default=list, help_text=_('List of user hobbies'))
    bio = models.TextField(blank=True, help_text=_('User biography'))
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    badges = models.JSONField(default=list, help_text=_('List of earned badges'))
    
    # Activity tracking
    last_activity = models.DateTimeField(null=True, blank=True)
    daily_xp_earned = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    last_daily_reset = models.DateField(default=timezone.now)
    
    # ManyToMany fields for future models
    # clubs_joined = models.ManyToManyField('Club', blank=True, related_name='members')
    
    show_email = models.BooleanField(default=False, help_text=_('Show email on profile'))
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Profile')
        verbose_name_plural = _('Profiles')
    
    def __str__(self):
        return f"{self.user.email}'s Profile"
    
    def calculate_level(self, xp=None):
        """Calculate level based on XP using exponential growth formula."""
        if xp is None:
            xp = self.xp
        
        level = 1
        remaining_xp = xp
        
        while remaining_xp >= level * 100:
            remaining_xp -= level * 100
            level += 1
        
        return level
    
    def get_xp_for_next_level(self):
        """Get XP needed for next level."""
        current_level = self.level
        xp_needed = current_level * 100
        return xp_needed
    
    def get_xp_progress_percent(self):
        """Get XP progress percentage for current level."""
        xp_in_current_level = self.xp
        for level in range(1, self.level):
            xp_in_current_level -= level * 100
        
        xp_needed_for_level = self.level * 100
        return min(100, (xp_in_current_level / xp_needed_for_level) * 100)
    
    def add_xp(self, amount, reason='admin_grant', description=''):
        """Add XP to the profile with logging and level calculation."""
        # Check daily XP limit (max 100 XP per day from activities)
        if reason in ['daily_activity', 'session_activity', 'profile_edit', 'comment']:
            self._check_daily_reset()
            if self.daily_xp_earned + amount > 100:
                amount = max(0, 100 - self.daily_xp_earned)
                if amount == 0:
                    return False  # Daily limit reached
        
        if amount > 0:
            old_level = self.level
        self.xp += amount
            self.daily_xp_earned += amount
            
            # Calculate new level
            new_level = self.calculate_level()
            level_up = new_level > old_level
            self.level = new_level
            
            self.save()
            
            # Log the XP gain
            XPLog.objects.create(
                profile=self,
                amount=amount,
                reason=reason,
                description=description
            )
            
            # Return level up info
            return {
                'success': True,
                'level_up': level_up,
                'old_level': old_level,
                'new_level': new_level,
                'xp_gained': amount
            }
        return {'success': False, 'level_up': False}
    
    def _check_daily_reset(self):
        """Reset daily XP counter if it's a new day."""
        today = timezone.now().date()
        if self.last_daily_reset < today:
            self.daily_xp_earned = 0
            self.last_daily_reset = today
        self.save()
    
    def get_daily_xp_remaining(self):
        """Get remaining daily XP that can be earned."""
        self._check_daily_reset()
        return max(0, 100 - self.daily_xp_earned)
    
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
    
    def start_activity_session(self):
        """Start a new activity session."""
        # End any existing active session
        UserActivity.objects.filter(user=self.user, is_active=True).update(
            is_active=False,
            session_end=timezone.now()
        )
        
        # Create new session
        return UserActivity.objects.create(user=self.user)
    
    def end_activity_session(self):
        """End the current activity session and calculate XP."""
        try:
            session = UserActivity.objects.get(user=self.user, is_active=True)
            session.is_active = False
            session.session_end = timezone.now()
            
            # Calculate duration
            duration = session.session_end - session.session_start
            session.duration_minutes = int(duration.total_seconds() / 60)
            session.save()
            
            # Award XP for session activity (30+ min = 10 XP)
            xp_result = None
            if session.duration_minutes >= 30:
                xp_result = self.add_xp(10, 'session_activity', f'Session activity: {session.duration_minutes} minutes')
            
            # Check for daily activity reward (first 30+ min session of the day)
            daily_result = self._check_daily_activity_reward()
            
            return {
                'session': session,
                'xp_result': xp_result,
                'daily_result': daily_result
            }
        except UserActivity.DoesNotExist:
            return None
    
    def _check_daily_activity_reward(self):
        """Check if user should get daily activity XP (first 30+ min session of the day)."""
        today = timezone.now().date()
        today_activities = UserActivity.objects.filter(
            user=self.user,
            session_start__date=today,
            duration_minutes__gte=30
        )
        
        if today_activities.count() == 1:  # First 30+ min session of the day
            return self.add_xp(15, 'daily_activity', 'Daily activity milestone (30+ min)')
        return None

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
        self.from_user.profile.add_xp(20, 'collaboration', f'Collaboration accepted: {self.skill_focus}')
        self.to_user.profile.add_xp(20, 'collaboration', f'Collaboration accepted: {self.skill_focus}')
        
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