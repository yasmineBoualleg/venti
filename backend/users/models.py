from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from django.dispatch import receiver
from django.db.models.signals import post_save

class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    """
    email = models.EmailField(_('email address'), unique=True)
    level = models.PositiveIntegerField(default=1)
    xp = models.PositiveIntegerField(default=0)
    xp_to_next_level = models.PositiveIntegerField(default=100)
    # Comment: Add a field to store the Firebase UID for Google-authenticated users
    firebase_uid = models.CharField(max_length=128, unique=True, null=True, blank=True)
    
    # Make email the username field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def add_xp(self, amount):
        """Add XP and handle level ups."""
        self.xp += amount
        while self.xp >= self.xp_to_next_level:
            self.level_up()
        self.save()
    
    def level_up(self):
        """Handle level up logic."""
        self.level += 1
        self.xp -= self.xp_to_next_level
        self.xp_to_next_level = int(self.xp_to_next_level * 1.5)  # Increase XP needed for next level
        
    @property
    def level_progress(self):
        """Return level progress as percentage."""
        return (self.xp / self.xp_to_next_level) * 100
        
    def __str__(self):
        return self.email

class Profile(models.Model):
    """
    Extended profile information for users.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', default='avatars/default.png')
    bio = models.TextField(max_length=500, blank=True)
    university = models.ForeignKey(
        'university.University',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students'
    )
    graduation_year = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(2000)]
    )
    major = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=100, blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    website = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"

# Signal to create profile when user is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

# Add follower/following relationships to User model
User.add_to_class('followers', models.ManyToManyField(
    'self',
    symmetrical=False,
    related_name='following',
    blank=True
)) 