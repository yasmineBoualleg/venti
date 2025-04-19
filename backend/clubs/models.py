from django.db import models
from django.conf import settings
from django.utils.text import slugify

class Interest(models.Model):
    """Model for club interests/tags."""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

class Club(models.Model):
    """Model for student clubs."""
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    cover_photo = models.ImageField(upload_to='club_covers/', blank=True)
    interests = models.ManyToManyField(Interest, related_name='clubs')
    
    # Club management
    admins = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='clubs_administrating')
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, through='ClubMember', related_name='clubs_joined')
    
    # Club metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    external_links = models.JSONField(default=dict, blank=True)  # For Discord, Instagram, etc.

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']

class ClubRole(models.Model):
    """Model for roles within a club (e.g., President, Event Manager)."""
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='roles')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    permissions = models.JSONField(default=dict)  # Store role permissions as JSON
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} at {self.club.name}"

    class Meta:
        unique_together = ['club', 'name']

class ClubMember(models.Model):
    """Through model for club membership with roles."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    club = models.ForeignKey(Club, on_delete=models.CASCADE)
    role = models.ForeignKey(ClubRole, on_delete=models.SET_NULL, null=True, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        role_name = self.role.name if self.role else "Member"
        return f"{self.user.username} - {role_name} at {self.club.name}"

    class Meta:
        unique_together = ['user', 'club']

class Post(models.Model):
    """Model for club posts/announcements"""
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='club_posts')
    club = models.ForeignKey('Club', on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to='club_post_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_club_posts', blank=True)
    is_pinned = models.BooleanField(default=False)
    is_announcement = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'club_posts'
        ordering = ['-created_at']
        
    def __str__(self):
        return self.title 