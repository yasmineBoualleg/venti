from django.db import models
from django.conf import settings

class Post(models.Model):
    """Base model for all types of posts."""
    TYPE_CHOICES = [
        ('TEXT', 'Text'),
        ('IMAGE', 'Image'),
        ('POLL', 'Poll'),
        ('EVENT', 'Event'),
    ]

    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to='post_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_posts', blank=True)
    is_pinned = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return self.title

class Poll(models.Model):
    """Model for polls attached to posts."""
    post = models.OneToOneField(Post, on_delete=models.CASCADE, related_name='poll')
    question = models.CharField(max_length=200)
    end_date = models.DateTimeField(null=True, blank=True)
    is_multiple_choice = models.BooleanField(default=False)
    
    def __str__(self):
        return self.question

class PollOption(models.Model):
    """Model for poll options."""
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=200)
    votes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='poll_votes', blank=True)
    
    def __str__(self):
        return self.text
    
    @property
    def vote_count(self):
        return self.votes.count()

class Comment(models.Model):
    """Model for comments on posts."""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_comments', blank=True)
    
    class Meta:
        ordering = ['created_at']
        
    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.title}"

class Notebook(models.Model):
    """Model for user notebooks."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notebooks')
    title = models.CharField(max_length=255)
    content = models.JSONField(blank=True, default=dict)
    type = models.CharField(max_length=50, default='copybook')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.user.email})"
